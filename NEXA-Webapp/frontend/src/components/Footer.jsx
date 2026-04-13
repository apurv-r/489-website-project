import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-nexa">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <span className="brand-n">N</span><span className="brand-rest">EXA</span>
            </div>
            <p className="footer-desc">
              The marketplace that connects drivers with affordable, local
              parking spaces — and helps homeowners earn from unused spots.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Twitter/X">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="footer-social-link" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="footer-social-link" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-heading">Platform</h6>
            <ul className="footer-links">
              <li>
                <Link to="/search">Search Parking</Link>
              </li>
              <li>
                <Link to="/register">List Your Space</Link>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-heading">Resources</h6>
            <ul className="footer-links">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Safety</a>
              </li>
              <li>
                <a href="#">Host Guide</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-heading">Legal</h6>
            <ul className="footer-links">
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-heading">Contact</h6>
            <ul className="footer-links">
              <li>
                <a href="mailto:support@nexa.park">
                  <i className="bi bi-envelope me-1"></i> support@nexa.park
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="bi bi-geo-alt me-1"></i> Seattle, WA
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">&copy; 2026 NEXA. All rights reserved. Built for CptS 489.</p>
        </div>
      </div>
    </footer>
  );
}