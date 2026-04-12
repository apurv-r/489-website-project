import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Booking() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [paying, setPaying] = useState(false);

  function formatCard(val) {
    const v = val.replace(/\D/g, '').slice(0, 16);
    if (/^4/.test(v)) setCardBrand('VISA');
    else if (/^5[1-5]/.test(v)) setCardBrand('MC');
    else if (/^3[47]/.test(v)) setCardBrand('AMEX');
    else setCardBrand('');
    setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
  }

  function formatExpiry(val) {
    let v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
    setExpiry(v);
  }

  function handlePay(e) {
    e.preventDefault();
    setPaying(true);
    setTimeout(() => navigate('/confirmation'), 2000);
  }

  return (
    <>
      <main className="booking-main">
        <div className="container" style={{ maxWidth: 1040, paddingTop: 88, paddingBottom: '3rem' }}>
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb booking-breadcrumb">
              <li className="breadcrumb-item"><Link to="/search">Search</Link></li>
              <li className="breadcrumb-item"><Link to="/details">Private Garage · Capitol Hill</Link></li>
              <li className="breadcrumb-item active">Confirm &amp; Pay</li>
            </ol>
          </nav>

          <div className="booking-layout">
            {/* LEFT */}
            <div className="booking-col-left">
              <section className="bk-section">
                <h2 className="bk-section-title">Your booking</h2>
                <div className="bk-trip-rows">
                  <div className="bk-trip-row">
                    <div className="bk-trip-label"><i className="bi bi-calendar3"></i> Start date</div>
                    <div className="bk-trip-value">Mon, Jun 9, 2025</div>
                  </div>
                  <div className="bk-trip-row">
                    <div className="bk-trip-label"><i className="bi bi-calendar3"></i> End date</div>
                    <div className="bk-trip-value">Thu, Jun 12, 2025</div>
                  </div>
                  <div className="bk-trip-row">
                    <div className="bk-trip-label"><i className="bi bi-clock"></i> Duration</div>
                    <div className="bk-trip-value">3 days</div>
                  </div>
                </div>
              </section>

              <div className="bk-divider"></div>

              <section className="bk-section">
                <h2 className="bk-section-title">Payment</h2>
                <form onSubmit={handlePay}>
                  <div className="bk-field">
                    <label htmlFor="cardNumber">Card number</label>
                    <div className="bk-input-wrap">
                      <i className="bi bi-credit-card bk-input-icon"></i>
                      <input type="text" id="cardNumber" className="form-control bk-input" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => formatCard(e.target.value)} maxLength={19} inputMode="numeric" />
                      <span className="bk-card-brand">{cardBrand}</span>
                    </div>
                  </div>
                  <div className="bk-field">
                    <label htmlFor="cardName">Name on card</label>
                    <div className="bk-input-wrap">
                      <i className="bi bi-person bk-input-icon"></i>
                      <input type="text" id="cardName" className="form-control bk-input" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="bk-field-row">
                    <div className="bk-field">
                      <label htmlFor="cardExpiry">Expiry</label>
                      <div className="bk-input-wrap">
                        <i className="bi bi-calendar2 bk-input-icon"></i>
                        <input type="text" id="cardExpiry" className="form-control bk-input" placeholder="MM / YY" value={expiry} onChange={e => formatExpiry(e.target.value)} maxLength={7} inputMode="numeric" />
                      </div>
                    </div>
                    <div className="bk-field">
                      <label htmlFor="cardCvv">CVV</label>
                      <div className="bk-input-wrap">
                        <i className="bi bi-lock bk-input-icon"></i>
                        <input type="text" id="cardCvv" className="form-control bk-input" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} inputMode="numeric" />
                      </div>
                    </div>
                  </div>
                  <p className="bk-secure-note"><i className="bi bi-shield-lock-fill"></i> Your payment info is encrypted and never stored.</p>

                  <div className="bk-divider"></div>

                  <section className="bk-section">
                    <h2 className="bk-section-title">Cancellation policy</h2>
                    <p className="bk-policy-text"><strong>Free cancellation</strong> up to 48 hours before the booking start date. After that, the rate is non-refundable.</p>
                  </section>

                  {/* Pay button inside right col on mobile — shown here for form submit */}
                  <button type="submit" className="btn btn-nexa w-100 bk-pay-btn d-lg-none mt-3" disabled={paying}>
                    {paying
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing…</>
                      : <><i className="bi bi-lock-fill me-2"></i>Confirm &amp; Pay</>}
                  </button>
                </form>
              </section>
            </div>

            {/* RIGHT */}
            <div className="booking-col-right">
              <div className="bk-summary-card">
                <div className="bk-summary-img">
                  <img src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80" alt="Parking listing" />
                </div>
                <div className="bk-summary-body">
                  <div className="bk-summary-type">Private Garage</div>
                  <h3 className="bk-summary-title">Private Garage · Capitol Hill</h3>
                  <div className="bk-summary-rating">
                    <i className="bi bi-star-fill"></i> 4.9
                    <span className="bk-summary-reviews">(38 reviews)</span>
                  </div>
                </div>
                <div className="bk-summary-divider"></div>
                <div className="bk-price-rows">
                  <div className="bk-price-row"><span>$5 × 3 days</span><span>$15.00</span></div>
                  <div className="bk-price-row"><span>Service fee (5%)</span><span>$0.75</span></div>
                </div>
                <div className="bk-summary-divider"></div>
                <div className="bk-price-row bk-price-total"><span>Total</span><span>$15.75</span></div>
                <button className="btn btn-nexa w-100 bk-pay-btn d-none d-lg-block" onClick={handlePay} disabled={paying}>
                  {paying
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing…</>
                    : <><i className="bi bi-lock-fill me-2"></i>Confirm &amp; Pay</>}
                </button>
                <p className="bk-pay-note">You won't be charged until you confirm.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
