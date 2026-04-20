import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const DEFAULT_CENTER = [47.6062, -122.3321];
const DEFAULT_ZOOM = 11;

const TYPES = ["all", "garage", "driveway", "open-lot", "covered"];
const WEEKDAY_TOKEN_TO_INDEX = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function toDisplayType(type) {
  switch (String(type || "").toLowerCase()) {
    case "open lot":
      return "Open Lot";
    case "garage":
      return "Garage";
    case "driveway":
      return "Driveway";
    case "covered":
      return "Covered";
    default:
      return "Parking";
  }
}

function toTypeKey(type) {
  const lowered = String(type || "").toLowerCase();

  if (lowered === "open lot") {
    return "open-lot";
  }

  return lowered;
}

function toLocationLabel(location) {
  if (!location) {
    return "Location unavailable";
  }

  const city = String(location.city || "").trim();
  const state = String(location.state || "").trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  if (city) {
    return city;
  }

  if (state) {
    return state;
  }

  return "Location unavailable";
}

function MapBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (markers.length === 1) {
      map.setView(markers[0].position, 13);
      return;
    }

    const bounds = L.latLngBounds(markers.map((marker) => marker.position));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, markers]);

  return null;
}

function createPriceMarkerIcon(priceText) {
  return L.divIcon({
    className: "nexa-price-marker-wrap",
    html: `
      <div class="nexa-price-marker">
        <span class="nexa-price-marker-label">${priceText}</span>
        <span class="nexa-price-marker-pin"></span>
      </div>
    `,
    iconSize: [70, 42],
    iconAnchor: [35, 40],
    popupAnchor: [0, -36],
  });
}

function parseDateInput(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function doesListingMatchDateWindow(listing, startDateValue, endDateValue) {
  const startDate = parseDateInput(startDateValue);
  const endDate = parseDateInput(endDateValue || startDateValue);

  if (!startDate && !endDate) {
    return true;
  }

  if (!startDate || !endDate || endDate < startDate) {
    return false;
  }

  const availableWeekdays = new Set(
    (Array.isArray(listing.availableDays) ? listing.availableDays : [])
      .map(
        (day) =>
          WEEKDAY_TOKEN_TO_INDEX[
            String(day || "")
              .trim()
              .toLowerCase()
          ],
      )
      .filter(Number.isInteger),
  );

  if (availableWeekdays.size === 0) {
    return true;
  }

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    if (!availableWeekdays.has(cursor.getDay())) {
      return false;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return true;
}

export default function Search(user) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeType, setActiveType] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [startDate, setStartDate] = useState(() => searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("end") || "");
  const [searchValidationMessage, setSearchValidationMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (!user?._id) return;
    axios.get(`${API_BASE_URL}/api/users/${user._id}/favorites`, { withCredentials: true })
      .then(res => setFavoriteIds(new Set(res.data.map(l => l._id))))
      .catch(() => {});
  }, [user?._id]);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setStartDate(searchParams.get("start") || "");
    setEndDate(searchParams.get("end") || "");
    setSearchValidationMessage("");
  }, [searchParams]);

  function handleFavorite(id) {
    if (!user?._id) return;
    const isFav = favoriteIds.has(id);
    const method = isFav ? 'delete' : 'put';
    axios[method](`${API_BASE_URL}/api/users/${user._id}/favorites/${id}`, {}, { withCredentials: true })
      .then(() => {
        setFavoriteIds(prev => {
          const next = new Set(prev);
          isFav ? next.delete(id) : next.add(id);
          return next;
        });
      })
      .catch(err => console.log('error toggling favorite:', err));
  }

  function applySearchFilters(queryText, startDateValue, endDateValue) {
    const normalizedQuery = String(queryText || "").trim();
    const normalizedStartDate = String(startDateValue || "").trim();
    const normalizedEndDate = String(endDateValue || "").trim();

    if (!normalizedQuery || !normalizedStartDate || !normalizedEndDate) {
      setSearchValidationMessage("Please complete location, start date, and end date.");
      return;
    }

    if (normalizedEndDate < normalizedStartDate) {
      setSearchValidationMessage("End date cannot be earlier than start date.");
      return;
    }

    setSearchValidationMessage("");
    const nextParams = new URLSearchParams(searchParams);

    if (normalizedQuery) {
      nextParams.set("q", normalizedQuery);
    } else {
      nextParams.delete("q");
    }

    if (normalizedStartDate) {
      nextParams.set("start", normalizedStartDate);
    } else {
      nextParams.delete("start");
    }

    if (normalizedEndDate) {
      nextParams.set("end", normalizedEndDate);
    } else {
      nextParams.delete("end");
    }

    setSearchParams(nextParams);
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces`);

        if (isMounted) {
          console.log("Fetched listings:", response.data);
          setListings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          "Unable to load parking listings right now. Please try again.";

        setErrorMessage(backendMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const mappedListings = useMemo(
    () =>
      listings.map((listing) => {
        const typeLabel = toDisplayType(listing.parkingType);
        const typeKey = toTypeKey(listing.parkingType);

        return {
          id: listing._id,
          img: listing.imageUrls?.[0] || "",
          title: listing.title || `${typeLabel} Listing`,
          location: toLocationLabel(listing.location),
          availableDays: Array.isArray(listing.availableDays) ? listing.availableDays : [],
          searchText: [
            listing.title,
            listing.parkingType,
            listing?.location?.address,
            listing?.location?.city,
            listing?.location?.state,
            listing?.location?.zipCode,
          ]
            .map((part) =>
              String(part || "")
                .trim()
                .toLowerCase(),
            )
            .filter(Boolean)
            .join(" "),
          latitude: Number(listing?.location?.latitude),
          longitude: Number(listing?.location?.longitude),
          tags: [typeLabel],
          typeKey,
          price: Number.isFinite(Number(listing.dailyRate))
            ? `$${Number(listing.dailyRate).toFixed(2)}`
            : "$0.00",
          rating: listing.reviewCount > 0 ? Number(listing.ratingAverage).toFixed(1) : "—",
        };
      }),
    [listings],
  );

  const appliedSearchQuery = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const appliedStartDate = useMemo(() => searchParams.get("start") || "", [searchParams]);
  const appliedEndDate = useMemo(() => searchParams.get("end") || "", [searchParams]);
  const normalizedSearchQuery = useMemo(
    () => appliedSearchQuery.trim().toLowerCase(),
    [appliedSearchQuery],
  );

  const queryFilteredListings = useMemo(() => {
    if (!normalizedSearchQuery) {
      return mappedListings;
    }

    return mappedListings.filter((listing) => listing.searchText.includes(normalizedSearchQuery));
  }, [mappedListings, normalizedSearchQuery]);

  const hasInvalidDateRange = useMemo(() => {
    const parsedStart = parseDateInput(appliedStartDate);
    const parsedEnd = parseDateInput(appliedEndDate);

    if (!parsedStart || !parsedEnd) {
      return false;
    }

    return parsedEnd < parsedStart;
  }, [appliedEndDate, appliedStartDate]);

  const dateFilteredListings = useMemo(() => {
    if (!appliedStartDate && !appliedEndDate) {
      return queryFilteredListings;
    }

    return queryFilteredListings.filter((listing) =>
      doesListingMatchDateWindow(listing, appliedStartDate, appliedEndDate),
    );
  }, [appliedEndDate, appliedStartDate, queryFilteredListings]);

  const hasAllRequiredFields = useMemo(() => {
    return Boolean(searchQuery.trim() && startDate && endDate);
  }, [endDate, searchQuery, startDate]);

  const hasPendingInvalidDateRange = useMemo(() => {
    return Boolean(startDate && endDate && endDate < startDate);
  }, [endDate, startDate]);

  const mapListings = useMemo(() => {
    return dateFilteredListings
      .filter((listing) => Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude))
      .filter((listing) => (activeType === "all" ? true : listing.typeKey === activeType))
      .map((listing) => ({
        ...listing,
        position: [listing.latitude, listing.longitude],
      }));
  }, [activeType, dateFilteredListings]);

  const filtered =
    activeType === "all"
      ? dateFilteredListings
      : dateFilteredListings.filter((listing) => listing.typeKey === activeType);

  return (
    <div className="search-page">
      <div className="search-layout">
        {/* LEFT PANEL */}
        <div className="search-panel" id="searchPanel">
          {/* Filters */}
          <div className="search-filters">
            <div className="search-filters-top">
              <div className="position-relative search-location-input">
                <i className="bi bi-geo-alt-fill search-filter-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  value={searchQuery}
                  placeholder="Location…"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchValidationMessage("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applySearchFilters(searchQuery, startDate, endDate);
                    }
                  }}
                />
              </div>

              <div className="search-date-range">
                <div className="position-relative">
                  <input
                    type="date"
                    className="form-control search-filter-date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      setSearchValidationMessage("");
                    }}
                  />
                </div>
                <span className="date-separator">→</span>
                <div className="position-relative">
                  <input
                    type="date"
                    className="form-control search-filter-date"
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      setSearchValidationMessage("");
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-nexa"
                style={{ flexShrink: 0, width: "10px" }}
                disabled={!hasAllRequiredFields || hasPendingInvalidDateRange}
                onClick={() => applySearchFilters(searchQuery, startDate, endDate)}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>

            <div className="search-filters-row">
              <div className="filter-chips">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    className={`filter-chip${activeType === t ? " active" : ""}`}
                    onClick={() => setActiveType(t)}
                  >
                    {t === "all" && "All"}
                    {t === "garage" && (
                      <>
                        <i className="bi bi-building me-1"></i>Garage
                      </>
                    )}
                    {t === "driveway" && (
                      <>
                        <i className="bi bi-house-door me-1"></i>Driveway
                      </>
                    )}
                    {t === "open-lot" && (
                      <>
                        <i className="bi bi-square me-1"></i>Open Lot
                      </>
                    )}
                    {t === "covered" && (
                      <>
                        <i className="bi bi-umbrella me-1"></i>Covered
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-result-count">
              <span className="text-gradient fw-bold">{filtered.length}</span> parking spots found
              {normalizedSearchQuery ? (
                <>
                  {" "}
                  for <strong>"{appliedSearchQuery.trim()}"</strong>
                </>
              ) : (
                <>
                  {" "}
                  across <strong>all locations</strong>
                </>
              )}
            </div>
            {searchValidationMessage && (
              <div className="mt-2" style={{ color: "#ff8080", fontSize: "0.85rem" }}>
                {searchValidationMessage}
              </div>
            )}
            {hasInvalidDateRange && (
              <div className="mt-2" style={{ color: "#ff8080", fontSize: "0.85rem" }}>
                End date cannot be earlier than start date.
              </div>
            )}
          </div>

          {/* Results */}
          <div className="search-results" id="searchResults">
            {loading ? (
              <div className="text-center py-5" style={{ color: "var(--nexa-gray-400)" }}>
                Loading listings...
              </div>
            ) : errorMessage ? (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5" style={{ color: "var(--nexa-gray-400)" }}>
                No parking listings found.
              </div>
            ) : (
              filtered.map((r) => (
                <Link to={`/details?id=${r.id}`} className="search-result-card" key={r.id}>
                  <div className="search-result-img">
                    {r.img ? (
                      <img src={r.img} alt={r.title} />
                    ) : (
                      <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--nexa-gray-400)",
                        }}
                      >
                        No image
                      </div>
                    )}
                    <button
                      className="listing-save"
                      onClick={(e) => { e.preventDefault(); handleFavorite(r.id); }}
                    >
                      <i className={`bi bi-heart${favoriteIds.has(r.id) ? '-fill' : ''}`}></i>
                    </button>
                  </div>
                  <div className="search-result-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="search-result-title">{r.title}</h6>
                      <div className="listing-rating">
                        <i className="bi bi-star-fill"></i> {r.rating}
                      </div>
                    </div>
                    <p className="search-result-location">
                      <i className="bi bi-geo-alt-fill"></i> {r.location}
                    </p>
                    <div className="listing-tags">
                      {r.tags.map((t) => (
                        <span className="listing-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="search-result-footer">
                      <div className="listing-price">
                        {r.price} <span>/ day</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="search-map" id="searchMap">
          {mapListings.length > 0 ? (
            <MapContainer
              center={mapListings[0].position}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="search-map-canvas"
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapBounds markers={mapListings} />
              {mapListings.map((listing) => (
                <Marker
                  key={listing.id}
                  position={listing.position}
                  icon={createPriceMarkerIcon(listing.price)}
                >
                  <Popup className="nexa-popup-wrapper">
                    <div className="nexa-popup">
                      <strong>{listing.title}</strong>
                      <div className="nexa-popup-price">{listing.price} / day</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--nexa-gray-300)",
                          marginBottom: 8,
                        }}
                      >
                        {listing.location}
                      </div>
                      <Link to={`/details?id=${listing.id}`} className="nexa-popup-link">
                        View details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div
              className="text-center"
              style={{
                color: "var(--nexa-gray-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "2rem",
              }}
            >
              <div>
                <i className="bi bi-map fs-1 mb-2 d-block"></i>
                <p className="mb-1">No map pins available for these results.</p>
                <small>Listings need latitude and longitude to appear on the map.</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
