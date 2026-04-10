import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AuthBox() {
  return (
    <div className="auth-box">
        <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-nexa-outline btn-nexa-sm">Log In</Link>
            <Link to="/register" className="btn btn-nexa btn-nexa-sm">Sign Up</Link>
          </div>
    </div>
  );
}