import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

function formatDateLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
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

function getDurationDays(startDate, endDate) {
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  return Math.round((endDate.getTime() - startDate.getTime()) / millisecondsInDay) + 1;
}

export default function Booking({ _id: userId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listingId");
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [listing, setListing] = useState(null);
  const [futureBookings, setFutureBookings] = useState([]);
  const [serviceFeePercent, setServiceFeePercent] = useState(5);

  const checkInDate = useMemo(() => parseDateKey(checkInParam), [checkInParam]);
  const checkOutDate = useMemo(() => parseDateKey(checkOutParam), [checkOutParam]);

  const selectedRangeKeys = useMemo(() => {
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      return [];
    }

    return eachDateInRange(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);

  const bookingDailyRate = useMemo(() => {
    const parsedRate = Number(listing?.dailyRate);
    return Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 0;
  }, [listing]);

  const bookingDays = useMemo(() => {
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      return 0;
    }

    return getDurationDays(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);

  const bookingSubtotal = bookingDays * bookingDailyRate;
  const serviceFee = bookingSubtotal * (serviceFeePercent / 100);
  const bookingTotal = bookingSubtotal + serviceFee;

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
      } catch {
        if (!isMounted) {
          return;
        }

        setIsAuthenticated(false);
        setLoading(false);
        navigate("/", { replace: true });
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const availableWeekdayIndexes = useMemo(() => {
    const indexes = new Set();

    (listing?.availableDays || []).forEach((day) => {
      const token = normalizeWeekdayToken(day);
      const weekdayIndex = WEEKDAY_TOKEN_TO_INDEX[token];

      if (Number.isInteger(weekdayIndex)) {
        indexes.add(weekdayIndex);
      }
    });

    return indexes;
  }, [listing]);

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

  const validation = useMemo(() => {
    if (!listingId) {
      return { valid: false, message: "Missing listing id in the booking URL." };
    }

    if (!checkInDate || !checkOutDate) {
      return { valid: false, message: "Missing check-in or check-out date in the booking URL." };
    }

    if (checkOutDate <= checkInDate) {
      return { valid: false, message: "Check-out must be after check-in." };
    }

    if (!listing) {
      return { valid: false, message: "" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return { valid: false, message: "Booking dates cannot be in the past." };
    }

    const blockedKey = selectedRangeKeys.find((dateKey) => {
      const currentDate = parseDateKey(dateKey);

      if (!currentDate) {
        return true;
      }

      if (bookedDates.has(dateKey)) {
        return true;
      }

      return availableWeekdayIndexes.size > 0 && !availableWeekdayIndexes.has(currentDate.getDay());
    });

    if (blockedKey) {
      return {
        valid: false,
        message: "The selected range overlaps a booked or unavailable day.",
      };
    }

    return { valid: true, message: "" };
  }, [
    bookedDates,
    checkInDate,
    checkOutDate,
    listing,
    listingId,
    availableWeekdayIndexes,
    selectedRangeKeys,
  ]);

  const paymentValidation = useMemo(() => {
    const errors = {};
    const cardDigits = cardNumber.replace(/\D/g, "");
    const nameValue = cardName.trim();
    const expiryMatch = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    const cvvDigits = cvv.replace(/\D/g, "");

    function luhnCheck(number) {
      let sum = 0;
      let shouldDouble = false;

      for (let i = number.length - 1; i >= 0; i -= 1) {
        let digit = Number(number[i]);

        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
      }

      return sum % 10 === 0;
    }

    if (cardDigits.length < 13 || cardDigits.length > 16) {
      errors.cardNumber = "Enter a valid card number.";
    } else if (!luhnCheck(cardDigits)) {
      errors.cardNumber = "Card number is not valid.";
    }

    if (!nameValue) {
      errors.cardName = "Name on card is required.";
    }

    if (!expiryMatch) {
      errors.expiry = "Enter expiry as MM / YY.";
    } else {
      const month = Number(expiryMatch[1]);
      const year = Number(expiryMatch[2]);
      const expiryDate = new Date(2000 + year, month, 0);
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (month < 1 || month > 12) {
        errors.expiry = "Expiry month must be between 01 and 12.";
      } else if (expiryDate < currentMonth) {
        errors.expiry = "Card expiry must be in the future.";
      }
    }

    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errors.cvv = "Enter a valid CVV.";
    }

    if (!validation.valid) {
      errors.booking = validation.message;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }, [cardNumber, cardName, expiry, cvv, validation]);

  const bookingImage =
    listing?.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80";
  const bookingTitle = listing?.title || "Parking listing";
  const bookingSubtitle = listing?.title || "Selected listing";
  const bookingType = listing?.parkingType || "Parking";
  const bookingRating =
    Number.isFinite(Number(listing?.ratingAverage)) && Number(listing?.reviewCount) > 0
      ? Number(listing.ratingAverage).toFixed(1)
      : "-";
  const bookingReviews = Number(listing?.reviewCount) || 0;

  const confirmationPayload = useMemo(() => {
    const hostName = `${listing?.host?.firstName || ""} ${listing?.host?.lastName || ""}`.trim();
    const fullAddress = [
      listing?.location?.address,
      listing?.location?.city,
      listing?.location?.state,
      listing?.location?.zipCode,
    ]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(", ");

    return {
      listingId,
      title: bookingTitle,
      type: bookingType,
      imageUrl: bookingImage,
      rating: bookingRating,
      reviewCount: bookingReviews,
      hostName: hostName || "Host",
      address: fullAddress || "Address unavailable",
      checkIn: checkInParam,
      checkOut: checkOutParam,
      days: bookingDays,
      dailyRate: bookingDailyRate,
      subtotal: bookingSubtotal,
      serviceFee,
      total: bookingTotal,
      referenceId: `NXA-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    };
  }, [
    listingId,
    bookingTitle,
    bookingType,
    bookingImage,
    bookingRating,
    bookingReviews,
    listing,
    checkInParam,
    checkOutParam,
    bookingDays,
    bookingDailyRate,
    bookingSubtotal,
    serviceFee,
    bookingTotal,
  ]);

  useEffect(() => {
    let isMounted = true;

    if (!authReady || !isAuthenticated) {
      return () => {
        isMounted = false;
      };
    }

    async function loadBookingData() {
      if (!listingId) {
        setError("Missing listing id. Please return to search and pick a space again.");
        setLoading(false);
        return;
      }

      if (!checkInDate || !checkOutDate) {
        setError("Missing check-in or check-out date. Please use the availability calendar again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [listingResponse, bookingsResponse, settingsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/parking-spaces/${listingId}`),
          axios.get(`${API_BASE_URL}/api/bookings/future/${listingId}`),
          axios.get(`${API_BASE_URL}/api/platform-settings`, {
            withCredentials: true,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setListing(listingResponse.data);
        setFutureBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);

        const nextServiceFee = Number(settingsResponse.data?.serviceFee);
        if (Number.isFinite(nextServiceFee) && nextServiceFee >= 0) {
          setServiceFeePercent(nextServiceFee);
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.response?.data?.message || "Unable to load this booking right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBookingData();

    return () => {
      isMounted = false;
    };
  }, [authReady, isAuthenticated, listingId, checkInDate, checkOutDate]);

  function formatCard(val) {
    const v = val.replace(/\D/g, "").slice(0, 16);
    if (/^4/.test(v)) setCardBrand("VISA");
    else if (/^5[1-5]/.test(v)) setCardBrand("MC");
    else if (/^3[47]/.test(v)) setCardBrand("AMEX");
    else setCardBrand("");
    setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
  }

  function fillDemoPaymentData() {
    setCardNumber("4242 4242 4242 4242");
    setCardName("Demo User");
    setExpiry("12 / 30");
    setCvv("123");
    setCardBrand("VISA");
    setPaymentErrors({});
  }

  function validateAndSetErrors() {
    setPaymentErrors(paymentValidation.errors);
    return paymentValidation.valid;
  }

  function formatExpiry(val) {
    let v = val.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = `${v.slice(0, 2)} / ${v.slice(2)}`;
    setExpiry(v);
  }

  async function handlePay(e) {
    e.preventDefault();

    if (!validateAndSetErrors()) {
      return;
    }

    const hostId = listing?.host?._id || listing?.host;

    if (!hostId) {
      setPaymentErrors((previous) => ({
        ...previous,
        booking: "Unable to determine host for this listing.",
      }));
      return;
    }

    setPaying(true);

    try {
      const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      });

      const renterId = meResponse.data?.user?._id;

      if (!renterId) {
        throw new Error("Missing authenticated renter context.");
      }

      const createPayload = {
        renter: renterId,
        host: hostId,
        parkingSpace: listingId,
        startDate: checkInDate.toISOString(),
        endDate: checkOutDate.toISOString(),
        totalAmount: Number(bookingTotal.toFixed(2)),
      };

      const createResponse = await axios.post(`${API_BASE_URL}/api/bookings`, createPayload, {
        withCredentials: true,
      });

      const createdBooking = createResponse.data;
      const createdReference = createdBooking?._id
        ? `BK-${String(createdBooking._id).slice(-8).toUpperCase()}`
        : confirmationPayload.referenceId;

      navigate(
        `/confirmation?listingId=${encodeURIComponent(listingId || "")}&checkIn=${encodeURIComponent(checkInParam || "")}&checkOut=${encodeURIComponent(checkOutParam || "")}`,
        {
          state: {
            confirmation: {
              ...confirmationPayload,
              bookingId: createdBooking?._id,
              bookingStatus: createdBooking?.status,
              referenceId: createdReference,
            },
          },
        },
      );
    } catch (requestError) {
      const statusCode = requestError?.response?.status;
      const backendMessage = requestError?.response?.data?.message;
      let message = backendMessage || "Unable to submit booking right now. Please try again.";

      if (!backendMessage && (statusCode === 401 || statusCode === 403)) {
        message = "Please log in as a renter before confirming your booking.";
      }

      setPaymentErrors((previous) => ({
        ...previous,
        booking: message,
      }));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="booking-main">
        <div
          className="container"
          style={{ maxWidth: 1040, paddingTop: 88, paddingBottom: "3rem" }}
        >
          <div className="alert alert-secondary" role="alert">
            Loading booking details...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-main">
      <div className="container" style={{ maxWidth: 1040, paddingTop: 88, paddingBottom: "3rem" }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb booking-breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/search">Search</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/details?id=${encodeURIComponent(listingId || "")}`}>{bookingTitle}</Link>
            </li>
            <li className="breadcrumb-item active">Confirm &amp; Pay</li>
          </ol>
        </nav>

        {error || !validation.valid ? (
          <div className="alert alert-warning mb-4" role="alert">
            {error || validation.message}
            <div className="mt-3">
              <Link
                to={`/details?id=${encodeURIComponent(listingId || "")}`}
                className="btn btn-nexa-outline btn-sm"
              >
                <i className="bi bi-arrow-left me-1"></i>Back to listing
              </Link>
            </div>
          </div>
        ) : null}

        <div className="booking-layout">
          <div className="booking-col-left">
            <section className="bk-section">
              <h2 className="bk-section-title">Your booking</h2>
              <div className="bk-trip-rows">
                <div className="bk-trip-row">
                  <div className="bk-trip-label">
                    <i className="bi bi-calendar3"></i> Start date
                  </div>
                  <div className="bk-trip-value">{formatDateLabel(checkInDate)}</div>
                </div>
                <div className="bk-trip-row">
                  <div className="bk-trip-label">
                    <i className="bi bi-calendar3"></i> End date
                  </div>
                  <div className="bk-trip-value">{formatDateLabel(checkOutDate)}</div>
                </div>
                <div className="bk-trip-row">
                  <div className="bk-trip-label">
                    <i className="bi bi-clock"></i> Duration
                  </div>
                  <div className="bk-trip-value">
                    {bookingDays} day{bookingDays === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            </section>

            <div className="bk-divider"></div>

            <section className="bk-section">
              <div className="bk-section-head">
                <h2 className="bk-section-title">Payment</h2>
                <div className="bk-demo-row">
                  <button
                    type="button"
                    className="btn btn-nexa-outline btn-sm bk-demo-btn"
                    onClick={fillDemoPaymentData}
                  >
                    <i className="bi bi-magic me-1"></i>Demo data
                  </button>
                </div>
              </div>

              <form onSubmit={handlePay}>
                <div className="bk-field">
                  <label htmlFor="cardNumber">Card number</label>
                  <div className="bk-input-wrap">
                    <i className="bi bi-credit-card bk-input-icon"></i>
                    <input
                      type="text"
                      id="cardNumber"
                      className="form-control bk-input"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => formatCard(e.target.value)}
                      maxLength={19}
                      inputMode="numeric"
                    />
                    <span className="bk-card-brand">{cardBrand}</span>
                  </div>
                  {paymentErrors.cardNumber && (
                    <div className="bk-field-error">{paymentErrors.cardNumber}</div>
                  )}
                </div>
                <div className="bk-field">
                  <label htmlFor="cardName">Name on card</label>
                  <div className="bk-input-wrap">
                    <i className="bi bi-person bk-input-icon"></i>
                    <input
                      type="text"
                      id="cardName"
                      className="form-control bk-input"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  {paymentErrors.cardName && (
                    <div className="bk-field-error">{paymentErrors.cardName}</div>
                  )}
                </div>
                <div className="bk-field-row">
                  <div className="bk-field">
                    <label htmlFor="cardExpiry">Expiry</label>
                    <div className="bk-input-wrap">
                      <i className="bi bi-calendar2 bk-input-icon"></i>
                      <input
                        type="text"
                        id="cardExpiry"
                        className="form-control bk-input"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => formatExpiry(e.target.value)}
                        maxLength={7}
                        inputMode="numeric"
                      />
                    </div>
                    {paymentErrors.expiry && (
                      <div className="bk-field-error">{paymentErrors.expiry}</div>
                    )}
                  </div>
                  <div className="bk-field">
                    <label htmlFor="cardCvv">CVV</label>
                    <div className="bk-input-wrap">
                      <i className="bi bi-lock bk-input-icon"></i>
                      <input
                        type="text"
                        id="cardCvv"
                        className="form-control bk-input"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        inputMode="numeric"
                      />
                    </div>
                    {paymentErrors.cvv && <div className="bk-field-error">{paymentErrors.cvv}</div>}
                  </div>
                </div>
                <p className="bk-secure-note">
                  <i className="bi bi-shield-lock-fill"></i> Your payment info is encrypted and
                  never stored.
                </p>
                {paymentErrors.booking && (
                  <div className="alert alert-danger py-2" role="alert">
                    {paymentErrors.booking}
                  </div>
                )}

                <div className="bk-divider"></div>

                <section className="bk-section">
                  <h2 className="bk-section-title">Cancellation policy</h2>
                  <p className="bk-policy-text">
                    <strong>Free cancellation</strong> up to 48 hours before the booking start date.
                    After that, the rate is non-refundable.
                  </p>
                </section>

                <button
                  type="submit"
                  className="btn btn-nexa w-100 bk-pay-btn d-lg-none mt-3"
                  disabled={paying || !paymentValidation.valid}
                >
                  {paying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Processing…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill me-2"></i>Confirm &amp; Pay
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          <div className="booking-col-right">
            <div className="bk-summary-card">
              <div className="bk-summary-img">
                <img src={bookingImage} alt={bookingTitle} />
              </div>
              <div className="bk-summary-body">
                <div className="bk-summary-type">{bookingType}</div>
                <h3 className="bk-summary-title">{bookingSubtitle}</h3>
                <div className="bk-summary-rating">
                  <i className="bi bi-star-fill"></i> {bookingRating}
                  <span className="bk-summary-reviews">({bookingReviews} reviews)</span>
                </div>
              </div>
              <div className="bk-summary-divider"></div>
              <div className="bk-price-rows">
                <div className="bk-price-row">
                  <span>
                    ${bookingDailyRate.toFixed(2)} × {bookingDays} day{bookingDays === 1 ? "" : "s"}
                  </span>
                  <span>${bookingSubtotal.toFixed(2)}</span>
                </div>
                <div className="bk-price-row">
                  <span>Service fee ({serviceFeePercent}%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="bk-summary-divider"></div>
              <div className="bk-price-row bk-price-total">
                <span>Total</span>
                <span>${bookingTotal.toFixed(2)}</span>
              </div>
              <button
                className="btn btn-nexa w-100 bk-pay-btn d-none d-lg-block"
                onClick={handlePay}
                disabled={paying || !paymentValidation.valid}
              >
                {paying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Processing…
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>Confirm &amp; Pay
                  </>
                )}
              </button>
              <p className="bk-pay-note">You won't be charged until you confirm.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
