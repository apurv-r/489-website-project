import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";
import HostSidebar from "../../components/HostSidebar";

const STEPS = ["Basic Info", "Photos", "Pricing & Availability", "Review"];
const DAY_OPTIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const DEFAULT_MAP_CENTER = [47.6062, -122.3321];
const DEFAULT_MAP_ZOOM = 11;

const PARKING_TYPE_MAP = {
  Garage: "garage",
  Driveway: "driveway",
  "Outdoor Lot": "open lot",
  Covered: "covered",
};

const VEHICLE_SIZE_MAP = {
  Compact: "compact",
  Standard: "standard",
  "SUV / Midsize": "suv/midsize",
  "Truck / Large": "truck/large",
};

const AMENITY_OPTIONS = [
  "EV Charging",
  "CCTV",
  "Well Lit",
  "Covered",
  "Keypad Entry",
  "Near Transit",
  "Accessible",
  "24/7 Access",
];

const AMENITY_ICON_MAP = {
  "EV Charging": "bi-lightning-charge-fill",
  CCTV: "bi-camera-video-fill",
  "Well Lit": "bi-lightbulb-fill",
  Covered: "bi-umbrella-fill",
  "Keypad Entry": "bi-key-fill",
  "Near Transit": "bi-bus-front-fill",
  Accessible: "bi-person-wheelchair",
  "24/7 Access": "bi-clock-history",
};

const US_STATE_OPTIONS = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const LOCATION_PICKER_ICON = L.divIcon({
  className: "nexa-location-picker-wrap",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #6c5ce7;
      border: 3px solid rgba(255,255,255,0.95);
      box-shadow: 0 8px 16px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LocationPinSelector({ position, onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={LOCATION_PICKER_ICON}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const nextPosition = marker.getLatLng();
          onSelect(nextPosition.lat, nextPosition.lng);
        },
      }}
    />
  );
}

function MapViewportController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
}

export default function HostCreateListing() {
  const [minListingPrice, setMinListingPrice] = useState(5);
  const [maxPhotosPerListing, setMaxPhotosPerListing] = useState(12);
  const [step, setStep] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocatingAddress, setIsLocatingAddress] = useState(false);
  const [geocodeMessage, setGeocodeMessage] = useState("");
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedDays, setSelectedDays] = useState(DAY_OPTIONS);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    parkingType: "",
    maxVehicleSize: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    description: "",
    dailyRate: "",
    minBookingDuration: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPlatformSettings() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/platform-settings`, {
          withCredentials: true,
        });

        if (!isMounted) {
          return;
        }

        const settings = response.data || {};
        const minPrice = Number(settings.minListingPrice);
        const maxPhotos = Number(settings.maxPhotosPerListing);

        if (Number.isFinite(minPrice) && minPrice >= 0) {
          setMinListingPrice(minPrice);
        }

        if (Number.isFinite(maxPhotos) && maxPhotos >= 1) {
          setMaxPhotosPerListing(maxPhotos);
        }
      } catch {
        // Keep defaults if settings are unavailable.
      }
    }

    loadPlatformSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPinPosition = useMemo(() => {
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return [latitude, longitude];
  }, [formData.latitude, formData.longitude]);

  function updateField(field, value) {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function updatePinCoordinates(latitude, longitude) {
    updateField("latitude", latitude.toFixed(6));
    updateField("longitude", longitude.toFixed(6));
  }

  async function findAddressOnMap() {
    const queryParts = [formData.address, formData.city, formData.state, formData.zipCode]
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);

    if (queryParts.length < 2) {
      setGeocodeMessage("Enter at least address and city/state to find your location.");
      return;
    }

    setIsLocatingAddress(true);
    setGeocodeMessage("");

    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: queryParts.join(", "),
          format: "json",
          limit: 1,
        },
      });

      const firstResult = Array.isArray(response.data) ? response.data[0] : null;

      if (!firstResult) {
        setGeocodeMessage(
          "Couldn't find that address. Try adding more detail or place a pin manually.",
        );
        return;
      }

      const latitude = Number(firstResult.lat);
      const longitude = Number(firstResult.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setGeocodeMessage(
          "Address lookup returned invalid coordinates. Please place a pin manually.",
        );
        return;
      }

      updatePinCoordinates(latitude, longitude);
      setMapCenter([latitude, longitude]);
      setMapZoom(15);
      setGeocodeMessage("Location found. Adjust the pin if needed.");
    } catch {
      setGeocodeMessage(
        "Address lookup is temporarily unavailable. You can still place the pin manually.",
      );
    } finally {
      setIsLocatingAddress(false);
    }
  }

  function toMinimumBookingDays(durationLabel) {
    if (durationLabel === "1 week") {
      return 7;
    }

    if (durationLabel === "1 month") {
      return 30;
    }

    const parsed = Number.parseInt(durationLabel, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  async function submitListing() {
    if (!validateAllRequired()) {
      return;
    }

    setIsSubmitting(true);
    setErrors((previous) => ({ ...previous, submit: "" }));

    try {
      const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      });
      const hostId = meResponse.data?.user?._id;

      if (!hostId) {
        throw new Error("Unable to identify host account. Please sign in again.");
      }

      const uploadFormData = new FormData();
      photos.forEach((photo) => {
        uploadFormData.append("images", photo.file);
      });

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/uploads/images`,
        uploadFormData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const imageUrls = (uploadResponse.data?.files || [])
        .map((entry) => entry.url)
        .filter(Boolean);

      if (imageUrls.length < 1) {
        throw new Error("Image upload failed. Please try again.");
      }

      const payload = {
        host: hostId,
        title: formData.title.trim(),
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state,
          zipCode: formData.zipCode.trim(),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
        description: formData.description.trim(),
        parkingType: PARKING_TYPE_MAP[formData.parkingType],
        maxVehicleSize: VEHICLE_SIZE_MAP[formData.maxVehicleSize],
        amenities: selectedAmenities,
        imageUrls,
        dailyRate: Number(formData.dailyRate),
        minimumBookingDays: toMinimumBookingDays(formData.minBookingDuration),
        availableDays: selectedDays.map((day) => day.toLowerCase()),
        isPublished: true, // TODO: Change to false if admin approval is required before publishing
      };

      const createResponse = await axios.post(`${API_BASE_URL}/api/parking-spaces`, payload, {
        withCredentials: true,
      });

      if (!createResponse.data?._id) {
        throw new Error("Listing creation succeeded but no ID was returned from server.");
      }

      setSuccess(true);
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        "We couldn't submit your listing right now. Please try again.";

      setErrors((previous) => ({
        ...previous,
        submit: backendMessage,
      }));
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleDay(day) {
    setSelectedDays((previous) => {
      const nextDays = previous.includes(day)
        ? previous.filter((entry) => entry !== day)
        : [...previous, day];

      if (nextDays.length > 0) {
        setErrors((current) => ({ ...current, availableDays: "" }));
      }

      return nextDays;
    });
  }

  function handlePhotoUpload(fileList) {
    const incomingFiles = Array.from(fileList || []);

    if (incomingFiles.length === 0) {
      return;
    }

    const onlyImages = incomingFiles.filter((file) => String(file.type || "").startsWith("image/"));
    const sizeFiltered = onlyImages.filter((file) => file.size <= 10 * 1024 * 1024);

    if (sizeFiltered.length !== incomingFiles.length) {
      setErrors((previous) => ({
        ...previous,
        photos: "Only image files up to 10 MB are allowed.",
      }));
    }

    setPhotos((previous) => {
      const remainingSlots = Math.max(0, maxPhotosPerListing - previous.length);
      const accepted = sizeFiltered.slice(0, remainingSlots).map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      const exceededPhotoLimit = sizeFiltered.length > remainingSlots;

      if (exceededPhotoLimit) {
        setErrors((current) => ({
          ...current,
          photos: `You can upload up to ${maxPhotosPerListing} photos per listing.`,
        }));
      }

      if (accepted.length > 0 && !exceededPhotoLimit) {
        setErrors((current) => ({ ...current, photos: "" }));
      }

      return [...previous, ...accepted];
    });
  }

  function removePhoto(photoId) {
    setPhotos((previous) => {
      const target = previous.find((photo) => photo.id === photoId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return previous.filter((photo) => photo.id !== photoId);
    });
  }

  function validateStep(currentStep) {
    const nextErrors = {};

    if (currentStep === 0) {
      if (!formData.title.trim()) nextErrors.title = "Listing title is required.";
      if (!formData.parkingType) nextErrors.parkingType = "Parking type is required.";
      if (!formData.maxVehicleSize) nextErrors.maxVehicleSize = "Max vehicle size is required.";
      if (!formData.address.trim()) nextErrors.address = "Address is required.";
      if (!formData.city.trim()) nextErrors.city = "City is required.";
      if (!formData.state) nextErrors.state = "State is required.";
      if (!formData.zipCode.trim()) {
        nextErrors.zipCode = "ZIP code is required.";
      } else if (!/^\d{5}(?:-\d{4})?$/.test(formData.zipCode.trim())) {
        nextErrors.zipCode = "Enter a valid ZIP code.";
      }
      if (!formData.latitude.trim()) {
        nextErrors.latitude = "Latitude is required.";
      } else {
        const latitude = Number(formData.latitude);
        if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
          nextErrors.latitude = "Latitude must be between -90 and 90.";
        }
      }
      if (!formData.longitude.trim()) {
        nextErrors.longitude = "Longitude is required.";
      } else {
        const longitude = Number(formData.longitude);
        if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
          nextErrors.longitude = "Longitude must be between -180 and 180.";
        }
      }
      if (!formData.description.trim()) nextErrors.description = "Description is required.";
    }

    if (currentStep === 2) {
      if (!formData.dailyRate || Number(formData.dailyRate) < Number(minListingPrice)) {
        nextErrors.dailyRate = `Daily rate must be at least $${Number(minListingPrice).toFixed(2)}.`;
      }
      if (!formData.minBookingDuration) {
        nextErrors.minBookingDuration = "Minimum booking duration is required.";
      }
      if (selectedDays.length < 1) {
        nextErrors.availableDays = "Select at least one available day.";
      }
    }

    if (currentStep === 1 && photos.length < 1) {
      nextErrors.photos = "Upload at least one image before continuing.";
    }

    if (currentStep === 1 && photos.length > maxPhotosPerListing) {
      nextErrors.photos = `You can upload up to ${maxPhotosPerListing} photos per listing.`;
    }

    setErrors((previous) => ({ ...previous, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  }

  function validateAllRequired() {
    const stepOneValid = validateStep(0);
    const stepTwoValid = validateStep(1);
    const stepThreeValid = validateStep(2);

    if (!stepOneValid) {
      setStep(0);
      return false;
    }

    if (!stepTwoValid) {
      setStep(1);
      return false;
    }

    if (!stepThreeValid) {
      setStep(2);
      return false;
    }

    return true;
  }

  function toggleAmenity(a) {
    setSelectedAmenities((arr) => (arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a]));
  }

  function next() {
    if (!validateStep(step)) {
      return;
    }

    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (success) {
    return (
      <div className="dash-page lsr-page">
        <Navbar variant="dashboard" />
        <div className="dash-layout">
          <HostSidebar />
          <main className="dash-main">
            <div className="text-center py-5">
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(0,230,118,0.12)",
                  border: "2px solid rgba(0,230,118,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                }}
              >
                <i className="bi bi-check-lg" style={{ fontSize: "2rem", color: "#00e676" }}></i>
              </div>
              <h2>Listing Submitted!</h2>
              <p style={{ color: "var(--nexa-gray-400)" }}>
                Your listing has been submitted for review. We'll notify you once it's approved.
              </p>
              <div className="d-flex gap-3 justify-content-center mt-4">
                <Link to="/host/my-listings" className="btn btn-nexa-outline">
                  Back to Listings
                </Link>
                <button
                  className="btn btn-nexa"
                  onClick={() => {
                    setStep(0);
                    setSuccess(false);
                    photos.forEach((photo) => {
                      if (photo.previewUrl) {
                        URL.revokeObjectURL(photo.previewUrl);
                      }
                    });
                    setPhotos([]);
                    setErrors({});
                    setSelectedAmenities([]);
                    setSelectedDays(DAY_OPTIONS);
                    setMapCenter(DEFAULT_MAP_CENTER);
                    setMapZoom(DEFAULT_MAP_ZOOM);
                    setGeocodeMessage("");
                    setFormData({
                      title: "",
                      parkingType: "",
                      maxVehicleSize: "",
                      address: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      latitude: "",
                      longitude: "",
                      description: "",
                      dailyRate: "",
                      minBookingDuration: "",
                    });
                  }}
                >
                  Add Another Listing
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page lsr-page">
      <Navbar variant="dashboard" />
      <div className="dash-layout">
        <HostSidebar />
        <main className="dash-main">
          <div className="dash-page-header">
            <div>
              <h1 className="dash-page-title">Create New Listing</h1>
              <p className="dash-page-sub">Fill in the details to list your parking space.</p>
            </div>
            <Link to="/host/my-listings" className="btn btn-nexa-outline btn-nexa-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Listings
            </Link>
          </div>

          {/* Step indicator */}
          <div className="lsr-steps">
            {STEPS.map((s, i) => (
              <>
                <div key={i} className={`lsr-step${i <= step ? " active" : ""}`}>
                  <span className="lsr-step-num">{i + 1}</span>
                  <span className="lsr-step-label">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className="lsr-step-line" key={`line-${i}`}></div>}
              </>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: "1.5rem" }}>
                Basic Information
              </h2>
              <div className="lsr-form-grid">
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Listing title</label>
                  <input
                    type="text"
                    className="lsr-input"
                    placeholder="e.g. Private Garage · Capitol Hill"
                    value={formData.title}
                    onChange={(event) => updateField("title", event.target.value)}
                  />
                  {errors.title && <small style={{ color: "#ff8080" }}>{errors.title}</small>}
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Parking type</label>
                  <select
                    className="lsr-input"
                    value={formData.parkingType}
                    onChange={(event) => updateField("parkingType", event.target.value)}
                  >
                    <option value="">Select type</option>
                    <option>Garage</option>
                    <option>Driveway</option>
                    <option>Outdoor Lot</option>
                    <option>Covered</option>
                  </select>
                  {errors.parkingType && (
                    <small style={{ color: "#ff8080" }}>{errors.parkingType}</small>
                  )}
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Max vehicle size</label>
                  <select
                    className="lsr-input"
                    value={formData.maxVehicleSize}
                    onChange={(event) => updateField("maxVehicleSize", event.target.value)}
                  >
                    <option value="">Select size</option>
                    <option>Compact</option>
                    <option>Standard</option>
                    <option>SUV / Midsize</option>
                    <option>Truck / Large</option>
                  </select>
                  {errors.maxVehicleSize && (
                    <small style={{ color: "#ff8080" }}>{errors.maxVehicleSize}</small>
                  )}
                </div>
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Address</label>
                  <input
                    type="text"
                    className="lsr-input"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(event) => updateField("address", event.target.value)}
                  />
                  {errors.address && <small style={{ color: "#ff8080" }}>{errors.address}</small>}
                </div>
                <div
                  className="lsr-form-group--full"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="lsr-form-group">
                    <label className="lsr-label">City</label>
                    <input
                      type="text"
                      className="lsr-input"
                      placeholder="Seattle"
                      value={formData.city}
                      onChange={(event) => updateField("city", event.target.value)}
                    />
                    {errors.city && <small style={{ color: "#ff8080" }}>{errors.city}</small>}
                  </div>
                  <div className="lsr-form-group-row">
                    <div className="lsr-form-group" style={{ width: "100%" }}>
                      <label className="lsr-label">State</label>
                      <select
                        className="lsr-input"
                        value={formData.state}
                        onChange={(event) => updateField("state", event.target.value)}
                      >
                        <option value="" disabled>
                          Select state
                        </option>
                        {US_STATE_OPTIONS.map((stateCode) => (
                          <option key={stateCode} value={stateCode}>
                            {stateCode}
                          </option>
                        ))}
                      </select>
                      {errors.state && <small style={{ color: "#ff8080" }}>{errors.state}</small>}
                    </div>
                    <div className="lsr-form-group" style={{ width: "100%" }}>
                      <label className="lsr-label">ZIP code</label>
                      <input
                        type="text"
                        className="lsr-input"
                        placeholder="98101"
                        value={formData.zipCode}
                        onChange={(event) => updateField("zipCode", event.target.value)}
                      />
                      {errors.zipCode && (
                        <small style={{ color: "#ff8080" }}>{errors.zipCode}</small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="lsr-form-group lsr-form-group--full">
                  <div
                    style={{
                      justifyContent: "space-between",
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <label className="lsr-label">Pin location</label>
                      <small
                        style={{
                          color: "var(--nexa-gray-500)",
                          display: "block",
                          marginBottom: "0.6rem",
                        }}
                      >
                        Click anywhere on the map to place your pin. Drag the pin to fine-tune the
                        spot.
                      </small>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-nexa-outline btn-nexa-sm"
                        onClick={findAddressOnMap}
                        disabled={isLocatingAddress}
                      >
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {isLocatingAddress ? "Finding..." : "Find on map"}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: "320px", width: "100%" }}
                      scrollWheelZoom
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                        maxZoom={20}
                      />
                      <MapViewportController center={mapCenter} zoom={mapZoom} />
                      <LocationPinSelector
                        position={selectedPinPosition}
                        onSelect={updatePinCoordinates}
                      />
                    </MapContainer>
                  </div>

                  {geocodeMessage && (
                    <small
                      style={{
                        color: geocodeMessage.startsWith("Location found")
                          ? "#75f2c3"
                          : "var(--nexa-gray-400)",
                        display: "block",
                        marginTop: "0.45rem",
                      }}
                    >
                      {geocodeMessage}
                    </small>
                  )}

                  {(errors.latitude || errors.longitude) && (
                    <small style={{ color: "#ff8080", display: "block", marginTop: "0.45rem" }}>
                      {errors.latitude || errors.longitude}
                    </small>
                  )}
                </div>
                <div className="lsr-form-group lsr-form-group--full">
                  <label className="lsr-label">Description</label>
                  <textarea
                    className="lsr-input lsr-textarea"
                    rows={4}
                    placeholder="Describe your space — access instructions, nearby landmarks, special features…"
                    value={formData.description}
                    onChange={(event) => updateField("description", event.target.value)}
                  ></textarea>
                  {errors.description && (
                    <small style={{ color: "#ff8080" }}>{errors.description}</small>
                  )}
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <label className="lsr-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                  Amenities
                </label>
                <div className="lsr-amenity-grid">
                  {AMENITY_OPTIONS.map((a) => (
                    <label key={a} className="lsr-amenity-check">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a)}
                        onChange={() => toggleAmenity(a)}
                      />
                      <i className={`bi ${AMENITY_ICON_MAP[a] || "bi-check-circle"}`}></i>
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 1 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: "1.5rem" }}>
                Photos
              </h2>
              <div
                className="lsr-upload-zone"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handlePhotoUpload(event.dataTransfer?.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(event) => {
                    handlePhotoUpload(event.target.files);
                    event.target.value = "";
                  }}
                />
                <i
                  className="bi bi-cloud-upload fs-2 d-block mb-2"
                  style={{ color: "var(--nexa-gray-500)" }}
                ></i>
                <p style={{ color: "var(--nexa-gray-400)" }}>
                  Drag &amp; drop photos here, or click to browse
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--nexa-gray-600)" }}>
                  PNG, JPG up to 10 MB each. Min. 1, max. {maxPhotosPerListing} photos.
                </p>
                <button
                  type="button"
                  className="btn btn-nexa-outline btn-nexa-sm mt-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <i className="bi bi-image me-1"></i>Choose Files
                </button>
              </div>
              {errors.photos && (
                <small
                  style={{
                    color: "#ff8080",
                    marginTop: "0.75rem",
                    display: "block",
                  }}
                >
                  {errors.photos}
                </small>
              )}
              {photos.length > 0 && (
                <div className="lsr-photo-preview">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="lsr-photo-thumb">
                      <img src={photo.previewUrl} alt={`Uploaded ${index + 1}`} />
                      <button
                        type="button"
                        className="lsr-photo-remove"
                        onClick={() => removePhoto(photo.id)}
                        aria-label="Remove photo"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pricing & Availability */}
          {step === 2 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: "1.5rem" }}>
                Pricing &amp; Availability
              </h2>
              <div className="lsr-form-grid">
                <div className="lsr-form-group">
                  <label className="lsr-label">Daily rate ($)</label>
                  <input
                    type="number"
                    className="lsr-input"
                    placeholder="0.00"
                    min={String(minListingPrice)}
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={(event) => updateField("dailyRate", event.target.value)}
                  />
                  <small style={{ color: "var(--nexa-gray-500)" }}>
                    Minimum allowed by platform: ${Number(minListingPrice).toFixed(2)}
                  </small>
                  {errors.dailyRate && (
                    <small style={{ color: "#ff8080" }}>{errors.dailyRate}</small>
                  )}
                </div>
                <div className="lsr-form-group">
                  <label className="lsr-label">Min. booking duration</label>
                  <select
                    className="lsr-input"
                    value={formData.minBookingDuration}
                    onChange={(event) => updateField("minBookingDuration", event.target.value)}
                  >
                    <option value="">Select duration</option>
                    <option value="1 day">1 day</option>
                    <option value="2 days">2 days</option>
                    <option value="3 days">3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="1 month">1 month</option>
                  </select>
                  {errors.minBookingDuration && (
                    <small style={{ color: "#ff8080" }}>{errors.minBookingDuration}</small>
                  )}
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <label className="lsr-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                  Available days
                </label>
                <div className="lsr-day-pills">
                  {DAY_OPTIONS.map((day) => (
                    <label key={day} className="lsr-day-pill">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
                {errors.availableDays && (
                  <small style={{ color: "#ff8080" }}>{errors.availableDays}</small>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: "1.5rem" }}>
                Review Your Listing
              </h2>
              <p style={{ color: "var(--nexa-gray-400)" }}>
                Double-check your information before submitting for review. Our team will verify and
                publish your listing within 24 hours.
              </p>
              <div
                className="alert"
                style={{
                  background: "rgba(108,92,231,0.1)",
                  border: "1px solid rgba(108,92,231,0.3)",
                  borderRadius: "10px",
                  padding: "1rem",
                  marginTop: "1rem",
                }}
              >
                <i className="bi bi-info-circle me-2" style={{ color: "var(--nexa-primary)" }}></i>
                By submitting, you confirm this is an accurate description of your space and you
                agree to NEXA's Host Terms.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-nexa-outline" onClick={back} disabled={step === 0}>
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-nexa" onClick={next}>
                Next <i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <button className="btn btn-nexa" onClick={submitListing} disabled={isSubmitting}>
                <i className="bi bi-send-fill me-2"></i>
                {isSubmitting ? "Submitting..." : "Submit Listing"}
              </button>
            )}
          </div>
          {errors.submit && (
            <div className="alert alert-danger mt-3" role="alert">
              {errors.submit}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
