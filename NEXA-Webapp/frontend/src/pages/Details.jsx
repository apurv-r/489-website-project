import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Toast from "../components/Toast";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

const DAY_LABELS = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const DETAIL_LOCATION_ICON = L.divIcon({
  className: "nexa-detail-location-marker-wrap",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #6c5ce7;
      border: 3px solid rgba(255,255,255,0.95);
      box-shadow: 0 8px 14px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = String(dateKey)
    .split("-")
    .map((part) => Number(part));

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateLabel(date) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function eachDateInRange(startDate, endDate) {
  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  const finalDate = new Date(endDate);
  finalDate.setHours(0, 0, 0, 0);

  while (cursor <= finalDate) {
    dates.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function normalizeWeekdayToken(day) {
  return String(day || "")
    .trim()
    .toLowerCase();
}

function buildCalendarCells(monthDate, bookedDates, availableWeekdayIndexes) {
  const firstDay = startOfMonth(monthDate);
  const firstWeekday = firstDay.getDay();
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ type: "empty", key: `empty-${i}` });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateKey = formatDateKey(date);
    const isBooked = bookedDates.has(dateKey);
    const hasWeekdayRestrictions = availableWeekdayIndexes.size > 0;
    const isUnavailableByWeekday =
      hasWeekdayRestrictions && !availableWeekdayIndexes.has(date.getDay());

    let status = "available";

    if (isBooked) {
      status = "booked";
    } else if (isUnavailableByWeekday) {
      status = "unavailable";
    }

    cells.push({
      type: "day",
      key: dateKey,
      date,
      dateKey,
      day,
      status,
      isPast: date < today,
      isToday: dateKey === formatDateKey(today),
    });
  }

  return cells;
}

function formatParkingType(type) {
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

function formatVehicleSize(size) {
  switch (String(size || "").toLowerCase()) {
    case "compact":
      return "Compact";
    case "standard":
      return "Standard";
    case "suv/midsize":
      return "SUV / Midsize";
    case "truck/large":
      return "Truck / Large";
    default:
      return "Any size";
  }
}

function formatAddress(location) {
  if (!location) {
    return "Address unavailable";
  }

  const parts = [location.address, location.city, location.state, location.zipCode]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address unavailable";
}

function getInitials(name) {
  return (
    String(name || "Host")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "H"
  );
}

function toMapUrl(location) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export default function Details(user) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarSectionRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const tooltipTimerRef = useRef(null);
  const listingId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [listing, setListing] = useState(null);
  const [futureBookings, setFutureBookings] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedCheckInKey, setSelectedCheckInKey] = useState("");
  const [selectedCheckOutKey, setSelectedCheckOutKey] = useState("");
  const [hoverCheckOutKey, setHoverCheckOutKey] = useState("");
  const [bookingTooltip, setBookingTooltip] = useState("");
  const [reserveButtonHovered, setReserveButtonHovered] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportCategory, setReportCategory] = useState("inaccurate listing");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [toast, setToast] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [calendarHoverTooltip, setCalendarHoverTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
    invalid: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchListing() {
      if (!listingId) {
        setErrorMessage("Missing listing id. Please choose a listing from search.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`);

        if (isMounted) {
          setListing(response.data);
          setActiveImg(0);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          "Unable to load this listing right now. Please try again.";

        setErrorMessage(backendMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    if (!listingId) return;
    axios
      .get(`${API_BASE_URL}/api/reviews/listing/${listingId}`)
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [listingId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchFutureBookings() {
      if (!listingId) {
        setCalendarLoading(false);
        return;
      }

      setCalendarLoading(true);
      setCalendarError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/api/bookings/future/${listingId}`);

        if (isMounted) {
          setFutureBookings(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCalendarError(
          error.response?.data?.message || "Availability calendar could not be loaded right now.",
        );
      } finally {
        if (isMounted) {
          setCalendarLoading(false);
        }
      }
    }

    fetchFutureBookings();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (isMounted && response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setIsAuthenticated(false);
        if (error?.response?.status !== 401) {
          console.log(error);
        }
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const images = useMemo(() => listing?.imageUrls || [], [listing]);
  const hostName = useMemo(() => {
    const firstName = listing?.host?.firstName || "Host";
    const lastName = listing?.host?.lastName || "";
    return `${firstName} ${lastName}`.trim();
  }, [listing]);
  const hostIsVerified = useMemo(() => {
    return listing?.host?.isVerified;
  }, [listing]);

  const amenities = useMemo(() => listing?.amenities || [], [listing]);
  const availableDays = useMemo(() => listing?.availableDays || [], [listing]);
  const mapPosition = useMemo(() => {
    const latitude = Number(listing?.location?.latitude);
    const longitude = Number(listing?.location?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return [latitude, longitude];
  }, [listing]);
  const mapUrl = useMemo(() => toMapUrl(listing?.location), [listing]);
  const availableWeekdayIndexes = useMemo(() => {
    const indexes = new Set();

    availableDays.forEach((day) => {
      const token = normalizeWeekdayToken(day);
      const weekdayIndex = WEEKDAY_TOKEN_TO_INDEX[token];

      if (Number.isInteger(weekdayIndex)) {
        indexes.add(weekdayIndex);
      }
    });

    return indexes;
  }, [availableDays]);

  const selectedCheckInDate = useMemo(() => parseDateKey(selectedCheckInKey), [selectedCheckInKey]);
  const selectedCheckOutDate = useMemo(
    () => parseDateKey(selectedCheckOutKey),
    [selectedCheckOutKey],
  );
  const hoverCheckOutDate = useMemo(() => parseDateKey(hoverCheckOutKey), [hoverCheckOutKey]);

  const todayDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const todayKey = useMemo(() => formatDateKey(todayDate), [todayDate]);

  const bookedDates = useMemo(() => {
    const dates = new Set();

    futureBookings.forEach((booking) => {
      if (!booking?.startDate || !booking?.endDate) {
        return;
      }

      eachDateInRange(new Date(booking.startDate), new Date(booking.endDate)).forEach((dateKey) => {
        dates.add(dateKey);
      });
    });

    return dates;
  }, [futureBookings]);

  const calendarCells = useMemo(
    () => buildCalendarCells(calendarMonth, bookedDates, availableWeekdayIndexes),
    [calendarMonth, bookedDates, availableWeekdayIndexes],
  );

  const getDateStatus = useCallback(
    (date) => {
      if (!date) {
        return "invalid";
      }

      const dateKey = formatDateKey(date);

      if (bookedDates.has(dateKey)) {
        return "booked";
      }

      if (date < todayDate) {
        return "past";
      }

      if (availableWeekdayIndexes.size > 0 && !availableWeekdayIndexes.has(date.getDay())) {
        return "unavailable";
      }

      return "available";
    },
    [bookedDates, todayDate, availableWeekdayIndexes],
  );

  const getRangeKeys = useCallback((startDate, endDate) => {
    if (!startDate || !endDate || endDate < startDate) {
      return [];
    }

    return eachDateInRange(startDate, endDate);
  }, []);

  const getBlockedRangeKey = useCallback(
    (startDate, endDate) => {
      const rangeKeys = getRangeKeys(startDate, endDate);

      for (const dateKey of rangeKeys) {
        const currentDate = parseDateKey(dateKey);

        if (!currentDate) {
          return dateKey;
        }

        const status = getDateStatus(currentDate);
        if (status !== "available") {
          return dateKey;
        }
      }

      return "";
    },
    [getDateStatus, getRangeKeys],
  );

  const confirmedRangeKeys = useMemo(
    () => new Set(getRangeKeys(selectedCheckInDate, selectedCheckOutDate)),
    [selectedCheckInDate, selectedCheckOutDate, getRangeKeys],
  );

  const previewRange = useMemo(() => {
    if (!selectedCheckInDate || selectedCheckOutDate || !hoverCheckOutDate) {
      return { keys: new Set(), blockedKey: "" };
    }

    if (hoverCheckOutDate <= selectedCheckInDate) {
      return { keys: new Set(), blockedKey: "" };
    }

    const rangeKeys = getRangeKeys(selectedCheckInDate, hoverCheckOutDate);
    const blockedKey = getBlockedRangeKey(selectedCheckInDate, hoverCheckOutDate);

    return { keys: new Set(rangeKeys), blockedKey };
  }, [
    selectedCheckInDate,
    selectedCheckOutDate,
    hoverCheckOutDate,
    getRangeKeys,
    getBlockedRangeKey,
  ]);

  const bookingSelectionBlockedKey = useMemo(() => {
    if (!selectedCheckInDate || !selectedCheckOutDate) {
      return "";
    }

    return getBlockedRangeKey(selectedCheckInDate, selectedCheckOutDate);
  }, [selectedCheckInDate, selectedCheckOutDate, getBlockedRangeKey]);

  const bookingSelectionError = useMemo(() => {
    if (!selectedCheckInDate) {
      return "";
    }

    if (!selectedCheckOutDate) {
      return "";
    }

    if (selectedCheckOutDate <= selectedCheckInDate) {
      return "Check-out must be after check-in.";
    }

    if (bookingSelectionBlockedKey) {
      return "This range overlaps a booked or unavailable day.";
    }

    return "";
  }, [selectedCheckInDate, selectedCheckOutDate, bookingSelectionBlockedKey]);

  const bookingSelectionValid = Boolean(
    selectedCheckInDate &&
    selectedCheckOutDate &&
    selectedCheckOutDate > selectedCheckInDate &&
    !bookingSelectionBlockedKey,
  );

  const hasValidEndDate = bookingSelectionValid;

  const selectedDays = useMemo(() => {
    if (!bookingSelectionValid || !selectedCheckInDate || !selectedCheckOutDate) {
      return 0;
    }

    const millisecondsInDay = 1000 * 60 * 60 * 24;
    return (
      Math.round(
        (selectedCheckOutDate.getTime() - selectedCheckInDate.getTime()) / millisecondsInDay,
      ) + 1
    );
  }, [bookingSelectionValid, selectedCheckInDate, selectedCheckOutDate]);

  const bookingDailyRate = useMemo(() => {
    const parsedRate = Number(listing?.dailyRate);
    return Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 0;
  }, [listing]);

  const displayCheckInLabel = selectedCheckInDate
    ? formatDateLabel(selectedCheckInDate)
    : "Select in calendar";
  const displayCheckOutLabel = selectedCheckOutDate
    ? formatDateLabel(selectedCheckOutDate)
    : hoverCheckOutDate && selectedCheckInDate && hoverCheckOutDate > selectedCheckInDate
      ? formatDateLabel(hoverCheckOutDate)
      : "Select in calendar";

  const bookingTotalPrice = useMemo(
    () => selectedDays * bookingDailyRate,
    [selectedDays, bookingDailyRate],
  );

  const reserveButtonDisabled = !hasValidEndDate || sessionLoading || !isAuthenticated;
  const reserveButtonLabel =
    !isAuthenticated && reserveButtonHovered ? "Log in to proceed" : "Reserve Now";

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        window.clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  function showBookingTooltip(message) {
    setBookingTooltip(message);

    if (tooltipTimerRef.current) {
      window.clearTimeout(tooltipTimerRef.current);
    }

    tooltipTimerRef.current = window.setTimeout(() => {
      setBookingTooltip("");
    }, 2600);
  }

  function scrollToAvailabilityCalendar() {
    calendarSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleBookingInputClick() {
    showBookingTooltip("Use the interactive availability calendar below.");
    scrollToAvailabilityCalendar();
  }

  function getCalendarPointerPosition(event) {
    const containerRect = calendarContainerRef.current?.getBoundingClientRect();

    if (!containerRect) {
      return { x: 0, y: 0 };
    }

    return {
      x: event.clientX - containerRect.left + 12,
      y: event.clientY - containerRect.top + 12,
    };
  }

  function updateCalendarHoverTooltip(cell, event) {
    if (!selectedCheckInDate || selectedCheckOutDate) {
      setCalendarHoverTooltip((current) => ({ ...current, visible: false }));
      return;
    }

    const hoveredDate = parseDateKey(cell.dateKey);
    const pointer = getCalendarPointerPosition(event);

    if (!hoveredDate || hoveredDate <= selectedCheckInDate) {
      setCalendarHoverTooltip({
        visible: true,
        text: "Choose a check-out date after check-in.",
        x: pointer.x,
        y: pointer.y,
        invalid: true,
      });
      return;
    }

    const blockedKey = getBlockedRangeKey(selectedCheckInDate, hoveredDate);
    const rangeDays = getRangeKeys(selectedCheckInDate, hoveredDate).length;

    if (blockedKey) {
      setCalendarHoverTooltip({
        visible: true,
        text: "Range crosses an unavailable or booked day.",
        x: pointer.x,
        y: pointer.y,
        invalid: true,
      });
      return;
    }

    setCalendarHoverTooltip({
      visible: true,
      text: `${rangeDays} day${rangeDays === 1 ? "" : "s"} selected`,
      x: pointer.x,
      y: pointer.y,
      invalid: false,
    });
  }

  function handleCalendarDayClick(cell) {
    if (cell.status !== "available" || cell.isPast) {
      return;
    }

    if (!selectedCheckInDate || (selectedCheckInDate && selectedCheckOutDate)) {
      setSelectedCheckInKey(cell.dateKey);
      setSelectedCheckOutKey("");
      setHoverCheckOutKey("");
      setCalendarHoverTooltip((current) => ({ ...current, visible: false }));
      return;
    }

    const chosenEndDate = parseDateKey(cell.dateKey);
    if (!chosenEndDate || chosenEndDate <= selectedCheckInDate) {
      setSelectedCheckInKey(cell.dateKey);
      setSelectedCheckOutKey("");
      setHoverCheckOutKey("");
      setCalendarHoverTooltip((current) => ({ ...current, visible: false }));
      return;
    }

    const blockedKey = getBlockedRangeKey(selectedCheckInDate, chosenEndDate);
    if (blockedKey) {
      setCalendarHoverTooltip((current) => ({
        ...current,
        visible: true,
        text: "Range crosses an unavailable or booked day.",
        invalid: true,
      }));
      return;
    }

    setSelectedCheckOutKey(cell.dateKey);
    setHoverCheckOutKey("");
    setCalendarHoverTooltip((current) => ({ ...current, visible: false }));
  }

  function handleCalendarDayEnter(cell, event) {
    if (!selectedCheckInDate || selectedCheckOutDate) {
      return;
    }

    setHoverCheckOutKey(cell.dateKey);
    updateCalendarHoverTooltip(cell, event);
  }

  function handleCalendarDayMove(cell, event) {
    if (!selectedCheckInDate || selectedCheckOutDate) {
      return;
    }

    updateCalendarHoverTooltip(cell, event);
  }

  function handleCalendarLeave() {
    if (!selectedCheckOutDate) {
      setHoverCheckOutKey("");
      setCalendarHoverTooltip((current) => ({ ...current, visible: false }));
    }
  }

  function handleReserveNow() {
    if (!isAuthenticated) {
      return;
    }

    if (!bookingSelectionValid) {
      scrollToAvailabilityCalendar();
      showBookingTooltip("Pick a valid check-in and check-out range first.");
      return;
    }

    navigate(
      `/booking?listingId=${encodeURIComponent(listingId)}&checkIn=${encodeURIComponent(selectedCheckInKey)}&checkOut=${encodeURIComponent(selectedCheckOutKey)}`,
    );
  }

  function openReportModal() {
    if (!isAuthenticated) {
      setToast({ type: "error", message: "Please log in to report a listing." });
      return;
    }

    setShowReportModal(true);
  }

  async function handleSubmitReport(event) {
    event.preventDefault();

    if (!listing?._id) {
      return;
    }

    if (!reportTitle.trim() || !reportDescription.trim()) {
      setToast({ type: "error", message: "Please complete the report title and description." });
      return;
    }

    try {
      setReportSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/api/reports`,
        {
          reportedSpace: listing._id,
          category: reportCategory,
          title: reportTitle.trim(),
          description: reportDescription.trim(),
        },
        { withCredentials: true },
      );

      setShowReportModal(false);
      setReportTitle("");
      setReportDescription("");
      setReportCategory("inaccurate listing");
      setToast({ type: "success", message: "Report submitted successfully." });
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Unable to submit report right now.",
      });
    } finally {
      setReportSubmitting(false);
    }
  }

  function prevImage() {
    if (images.length < 2) {
      return;
    }

    setActiveImg((current) => (current - 1 + images.length) % images.length);
  }

  function nextImage() {
    if (images.length < 2) {
      return;
    }

    setActiveImg((current) => (current + 1) % images.length);
  }

  function goToPreviousMonth() {
    setCalendarMonth((current) => addMonths(current, -1));
  }

  function goToNextMonth() {
    setCalendarMonth((current) => addMonths(current, 1));
  }

  async function createMessageThread() {
    const host = listing.host;
    console.log("listing host: ", host);
    console.log("listing host id: ", host._id);
    //                                                    senderId, recipientId
    await axios
      .put(
        `${API_BASE_URL}/api/users/message/${user._id}/${host._id}`,
        {
          text: `Hi ${host.firstName}, I'm interested in your parking space "${listing.title}". Is it still available?`,
        },
        { withCredentials: true },
      )
      .then((response) => {
        console.log("successfully sent message: ", response.data);
        navigate(`/messages?to=${host._id}`);
      })
      .catch((error) => {
        console.log("error sending message: ", error);
      });
  }

  if (loading) {
    return (
      <main className="details-main">
        <div
          className="container-xl details-container text-center py-5"
          style={{ color: "var(--nexa-gray-400)" }}
        >
          Loading listing details...
        </div>
      </main>
    );
  }

  if (errorMessage || !listing) {
    return (
      <main className="details-main">
        <div className="details-breadcrumb">
          <div className="container-xl">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/search">Search</Link>
                </li>
                <li className="breadcrumb-item active">Listing details</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="container-xl details-container">
          <div className="alert alert-danger" role="alert">
            {errorMessage || "Listing not found."}
          </div>
          <Link to="/search" className="btn btn-nexa-outline">
            <i className="bi bi-arrow-left me-1"></i> Back to search
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="details-main">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      <div className="details-breadcrumb">
        <div className="container-xl">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/search">Search</Link>
              </li>
              <li className="breadcrumb-item active">{listing.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container-xl details-container">
        <div className="details-gallery">
          <div className="gallery-carousel">
            {images.length > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-arrow--prev"
                  onClick={prevImage}
                  type="button"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button
                  className="gallery-arrow gallery-arrow--next"
                  onClick={nextImage}
                  type="button"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </>
            )}
            <div className="gallery-16-9">
              {images.length > 0 ? (
                <img src={images[activeImg] || images[0]} alt={listing.title} />
              ) : (
                <div
                  className="w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ color: "var(--nexa-gray-400)" }}
                >
                  No images available
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="gallery-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`gallery-dot${index === activeImg ? " active" : ""}`}
                    onClick={() => setActiveImg(index)}
                  ></button>
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((src, index) => (
                <div
                  key={src}
                  className={`gallery-thumb${index === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(index)}
                >
                  <div className="gallery-thumb-16-9">
                    <img src={src} alt={`${listing.title} view ${index + 1}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-body">
          <div className="details-left">
            <div className="details-title-row">
              <div>
                <h1 className="details-title">{listing.title}</h1>
                <div className="details-meta">
                  <span>
                    <i className="bi bi-geo-alt-fill"></i> {formatAddress(listing.location)}
                  </span>
                  <span className="details-meta-dot">·</span>
                  <span className="listing-tag" style={{ display: "inline-block" }}>
                    {formatParkingType(listing.parkingType)}
                  </span>
                </div>
              </div>
              <div className="details-rating-badge">
                <i className="bi bi-star-fill"></i>
                <span>
                  {Number.isFinite(Number(listing.ratingAverage)) && listing.reviewCount > 0
                    ? Number(listing.ratingAverage).toFixed(1)
                    : "-"}
                </span>
                <small>({Number(listing.reviewCount) || 0} reviews)</small>
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">About this space</h2>
              <p className="details-description">
                {listing.description || "No description was provided for this listing."}
              </p>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Space details</h2>
              <div className="details-amenities">
                <div className="amenity-item">
                  <i className="bi bi-car-front"></i>
                  <span>{formatVehicleSize(listing.maxVehicleSize)}</span>
                </div>
                <div className="amenity-item">
                  <i className="bi bi-calendar2-week"></i>
                  <span>Min. {listing.minimumBookingDays || 1} day booking</span>
                </div>
                <div className="amenity-item">
                  <i className="bi bi-check-circle"></i>
                  <span>{listing.isVerified ? "Verified" : "Pending verification"}</span>
                </div>
                {listing.isPublished === false && (
                  <div className="amenity-item">
                    <i className="bi bi-binoculars"></i>
                    <span>{listing.isPublished ? "Published" : "Draft"}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Amenities</h2>
              {amenities.length > 0 ? (
                <div className="details-amenities">
                  {amenities.map((amenity) => (
                    <div className="amenity-item" key={amenity}>
                      <i
                        className={`bi ${AMENITY_ICON_MAP[amenity] || "bi-check-circle-fill"}`}
                      ></i>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="details-description">No amenities listed yet.</p>
              )}
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Availability</h2>
              <div
                className="details-amenities"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))" }}
              >
                {availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <div className="amenity-item" key={day}>
                      <i className="bi bi-calendar-check-fill"></i>
                      <span>{DAY_LABELS[day] || day}</span>
                    </div>
                  ))
                ) : (
                  <p className="details-description">No weekday restrictions specified.</p>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section" ref={calendarSectionRef}>
              <h2 className="details-section-title">Availability Calendar</h2>
              <div className="avail-calendar" ref={calendarContainerRef}>
                <div className="avail-cal-header">
                  <button
                    type="button"
                    className="avail-cal-nav"
                    onClick={goToPreviousMonth}
                    aria-label="Previous month"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <div className="avail-cal-month">{getMonthLabel(calendarMonth)}</div>
                  <button
                    type="button"
                    className="avail-cal-nav"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>

                {calendarLoading ? (
                  <div className="text-center py-4" style={{ color: "var(--nexa-gray-400)" }}>
                    Loading availability...
                  </div>
                ) : calendarError ? (
                  <div className="alert alert-warning mb-0" role="alert">
                    {calendarError}
                  </div>
                ) : (
                  <>
                    <div className="avail-cal-weekdays">
                      {WEEKDAY_LABELS.map((weekday) => (
                        <span key={weekday}>{weekday}</span>
                      ))}
                    </div>
                    <div className="avail-cal-grid" onMouseLeave={handleCalendarLeave}>
                      {calendarCells.map((cell) => {
                        if (cell.type === "empty") {
                          return <div key={cell.key} className="cal-cell cal-empty"></div>;
                        }

                        const cellClasses = ["cal-cell"];
                        const cellDate = parseDateKey(cell.dateKey);
                        const isConfirmedStart =
                          selectedCheckInKey === cell.dateKey && Boolean(selectedCheckOutKey);
                        const isConfirmedEnd = selectedCheckOutKey === cell.dateKey;
                        const isPreviewStart =
                          selectedCheckInKey === cell.dateKey &&
                          Boolean(hoverCheckOutKey) &&
                          !selectedCheckOutKey;
                        const isPreviewEnd =
                          hoverCheckOutKey === cell.dateKey &&
                          Boolean(selectedCheckInKey) &&
                          !selectedCheckOutKey;
                        const isSelectedOrPreviewStart =
                          isConfirmedStart ||
                          isPreviewStart ||
                          (selectedCheckInKey === cell.dateKey && !selectedCheckOutKey);
                        const isSelectedOrPreviewEnd = isConfirmedEnd || isPreviewEnd;
                        const isHoverPreview = previewRange.keys.has(cell.dateKey);
                        const isConfirmedRange = confirmedRangeKeys.has(cell.dateKey);
                        const isRangeEndpoint = isSelectedOrPreviewStart || isSelectedOrPreviewEnd;

                        if (cell.dateKey === todayKey) {
                          cellClasses.push("cal-today");
                        }

                        if (cell.status === "booked") {
                          cellClasses.push("cal-booked");
                        } else if (cell.status === "unavailable") {
                          cellClasses.push("cal-unavailable");
                        } else if (cell.isPast) {
                          cellClasses.push("cal-past");
                        } else {
                          cellClasses.push("cal-free");

                          if (isConfirmedRange && !isRangeEndpoint) {
                            cellClasses.push("cal-in-range");
                          }

                          if (isHoverPreview && !isRangeEndpoint) {
                            cellClasses.push(
                              previewRange.blockedKey ? "cal-hover-invalid" : "cal-hover-range",
                            );
                          }

                          if (isSelectedOrPreviewStart) {
                            cellClasses.push("cal-start", "cal-selected");
                          }

                          if (isSelectedOrPreviewEnd) {
                            cellClasses.push("cal-end", "cal-selected");
                          }
                        }

                        return (
                          <button
                            key={cell.key}
                            type="button"
                            className={cellClasses.join(" ")}
                            onClick={() => handleCalendarDayClick(cell)}
                            onMouseEnter={(event) => handleCalendarDayEnter(cell, event)}
                            onMouseMove={(event) => handleCalendarDayMove(cell, event)}
                            disabled={cell.status !== "available" || cell.isPast}
                            aria-label={`${cell.day} ${WEEKDAY_LABELS[cellDate?.getDay?.() ?? 0]} ${cell.status}`}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="avail-cal-legend">
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-free"></span>
                        <span>Available</span>
                      </div>
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-booked"></span>
                        <span>Booked</span>
                      </div>
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-unavailable"></span>
                        <span>Unavailable</span>
                      </div>
                      <div className="avail-legend-item">
                        <span className="avail-legend-dot avail-dot-selected"></span>
                        <span>Selected</span>
                      </div>
                    </div>
                    {calendarHoverTooltip.visible && (
                      <div
                        className={`avail-hover-tooltip${calendarHoverTooltip.invalid ? " is-invalid" : ""}`}
                        style={{ left: calendarHoverTooltip.x, top: calendarHoverTooltip.y }}
                        role="status"
                      >
                        {calendarHoverTooltip.text}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">Location</h2>
              <p className="details-description">{formatAddress(listing.location)}</p>
              <div
                className="details-map"
                id="detailMap"
                style={{
                  background: "var(--nexa-dark-card)",
                  overflow: "hidden",
                }}
              >
                {mapPosition ? (
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      subdomains="abcd"
                      maxZoom={20}
                    />
                    <Marker position={mapPosition} icon={DETAIL_LOCATION_ICON} />
                  </MapContainer>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ color: "var(--nexa-gray-400)" }}>
                      <i className="bi bi-map me-2"></i>Location coordinates are unavailable
                    </span>
                  </div>
                )}
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-nexa-outline btn-nexa-sm"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>

            <hr className="details-divider" />

            <div className="details-section">
              <h2 className="details-section-title">
                Reviews
                <span className="details-review-score">
                  <i className="bi bi-star-fill"></i>{" "}
                  {Number.isFinite(Number(listing.ratingAverage)) && listing.reviewCount > 0
                    ? Number(listing.ratingAverage).toFixed(1)
                    : "0.0"}{" "}
                  &nbsp;·&nbsp; {Number(listing.reviewCount) || 0} reviews
                </span>
              </h2>
              {reviews.length === 0 ? (
                <p className="details-description">
                  No reviews yet. Be the first to book this space.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    marginTop: "1rem",
                  }}
                >
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        borderBottom: "1px solid var(--nexa-border)",
                        paddingBottom: "1.25rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "var(--nexa-surface-2)",
                            flexShrink: 0,
                          }}
                        >
                          {r.renter?.profilePictureUrl ? (
                            <img
                              src={r.renter.profilePictureUrl}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                color: "var(--nexa-gray-400)",
                              }}
                            >
                              <i className="bi bi-person-fill" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: "0.92rem" }}>
                            {r.renter ? `${r.renter.firstName} ${r.renter.lastName}` : "Anonymous"}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--nexa-gray-500)",
                              margin: 0,
                            }}
                          >
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: "0.15rem" }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i
                              key={s}
                              className={`bi ${r.rating >= s ? "bi-star-fill" : "bi-star"}`}
                              style={{ color: "#ffc107", fontSize: "0.85rem" }}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p
                          style={{
                            color: "var(--nexa-gray-300)",
                            margin: 0,
                            lineHeight: 1.6,
                            fontSize: "0.9rem",
                          }}
                        >
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="details-right">
            <div className="booking-card">
              <div className="booking-card-price">
                $
                {Number.isFinite(Number(listing.dailyRate))
                  ? Number(listing.dailyRate).toFixed(2)
                  : "0.00"}{" "}
                <span>/ day</span>
              </div>
              <div className="booking-card-rating">
                <i className="bi bi-star-fill"></i>{" "}
                {Number.isFinite(Number(listing.ratingAverage)) && listing.reviewCount > 0
                  ? Number(listing.ratingAverage).toFixed(1)
                  : "-"}
                <span className="booking-card-reviews">
                  ({Number(listing.reviewCount) || 0} reviews)
                </span>
              </div>
              <div className="booking-dates">
                <div className="booking-date-field">
                  <label>Check-in</label>
                  <input
                    type="text"
                    className="form-control booking-date-input"
                    readOnly
                    value={displayCheckInLabel}
                    onClick={handleBookingInputClick}
                    onFocus={handleBookingInputClick}
                    aria-describedby="booking-date-hint"
                  />
                </div>
                <div className="booking-date-sep">
                  <i className="bi bi-arrow-right"></i>
                </div>
                <div className="booking-date-field">
                  <label>Check-out</label>
                  <input
                    type="text"
                    className="form-control booking-date-input"
                    readOnly
                    value={displayCheckOutLabel}
                    onClick={handleBookingInputClick}
                    onFocus={handleBookingInputClick}
                    aria-describedby="booking-date-hint"
                  />
                </div>
              </div>
              {bookingTooltip && (
                <div className="booking-date-tooltip" id="booking-date-hint" role="status">
                  {bookingTooltip}
                </div>
              )}
              {selectedCheckInDate && (
                <div className="booking-summary" role="status">
                  <div className="booking-summary-row">
                    <span>Check-in</span>
                    <span>{displayCheckInLabel}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Check-out</span>
                    <span>{bookingSelectionError || displayCheckOutLabel}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Days</span>
                    <span>{hasValidEndDate ? selectedDays : "—"}</span>
                  </div>
                  <div className="booking-summary-row booking-summary-total">
                    <span>Total</span>
                    <span>{hasValidEndDate ? `$${bookingTotalPrice.toFixed(2)}` : "—"}</span>
                  </div>
                </div>
              )}
              <div
                onMouseEnter={() => setReserveButtonHovered(true)}
                onMouseLeave={() => setReserveButtonHovered(false)}
              >
                <button
                  className="btn btn-nexa w-100 booking-btn"
                  onClick={handleReserveNow}
                  disabled={reserveButtonDisabled}
                >
                  <i
                    className={`bi ${!isAuthenticated && reserveButtonHovered ? "bi-box-arrow-in-right" : "bi-calendar-check"} me-2`}
                  ></i>
                  {reserveButtonLabel}
                </button>
              </div>
            </div>

            <div className="host-card">
              <div className="host-card-header">
                <div
                  className="host-avatar d-flex align-items-center justify-content-center"
                  style={{
                    background: "rgba(108,92,231,0.15)",
                    color: "var(--nexa-white)",
                    fontWeight: 700,
                    overflow: "hidden",
                  }}
                >
                  {listing?.host?.profilePictureUrl ? (
                    <img
                      src={listing.host.profilePictureUrl}
                      alt={hostName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(hostName)
                  )}
                </div>
                <div className="host-info">
                  <span className="host-name">{hostName}</span>
                  <span className="host-since">Listing host</span>
                  {hostIsVerified && (
                    <div className="host-badges">
                      <span className="host-badge">
                        <i className="bi bi-patch-check-fill"></i> Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="host-stats">
                <div className="host-stat">
                  <span className="host-stat-value">{Number(listing.reviewCount) || 0}</span>
                  <span className="host-stat-label">Reviews</span>
                </div>
                <div className="host-stat">
                  <span className="host-stat-value">
                    {Number.isFinite(Number(listing.ratingAverage))
                      ? Number(listing.ratingAverage).toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="host-stat-label">Rating</span>
                </div>
                <div className="host-stat">
                  <span className="host-stat-value">—</span>
                  <span className="host-stat-label">Response</span>
                </div>
              </div>
              <p className="host-bio">
                Hosted through NEXA. Contact the host after booking for any access instructions.
              </p>
              <button className="btn btn-nexa-outline w-100 chat-btn" onClick={createMessageThread}>
                <i className="bi bi-chat-dots-fill me-2"></i>Message Host
              </button>
              <div style={{ minHeight: "0.75rem" }}></div>
              <button
                className="btn btn-nexa-outline w-100 chat-btn"
                onClick={openReportModal}
                style={{
                  background: "rgba(220,53,69,0.12)",
                  color: "#dc3545",
                  border: "1px solid rgba(220,53,69,0.35)",
                }}
              >
                <i className="bi bi-flag-fill me-2"></i>Report Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div
          onClick={() => !reportSubmitting && setShowReportModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            padding: "1rem",
          }}
        >
          <div
            className="adm-card"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: 520 }}
          >
            <h3 className="adm-card-title" style={{ marginBottom: "0.5rem" }}>
              Report Listing
            </h3>
            <p style={{ margin: 0, color: "var(--nexa-gray-400)", fontSize: "0.9rem" }}>
              Tell us what looks wrong with this listing. Your report will be reviewed by an admin.
            </p>

            <form
              onSubmit={handleSubmitReport}
              style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}
            >
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--nexa-gray-300)" }}>Category</span>
                <select
                  value={reportCategory}
                  onChange={(event) => setReportCategory(event.target.value)}
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                >
                  <option value="inaccurate listing">Inaccurate listing</option>
                  <option value="fraud">Fraud</option>
                  <option value="safety issue">Safety issue</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--nexa-gray-300)" }}>Title</span>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(event) => setReportTitle(event.target.value)}
                  placeholder="Short summary of the issue"
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--nexa-gray-300)" }}>
                  Description
                </span>
                <textarea
                  rows={5}
                  value={reportDescription}
                  onChange={(event) => setReportDescription(event.target.value)}
                  placeholder="Explain what’s wrong with the listing"
                  style={{
                    padding: "0.7rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.24)",
                    background: "var(--nexa-surface)",
                    color: "var(--nexa-gray-200)",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
                    resize: "vertical",
                  }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "0.25rem",
                }}
              >
                <button
                  type="button"
                  className="btn btn-nexa-outline"
                  disabled={reportSubmitting}
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-nexa" disabled={reportSubmitting}>
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
