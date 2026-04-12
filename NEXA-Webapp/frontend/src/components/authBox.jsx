import { Link } from 'react-router-dom';

export default function AuthBox({ isSession, dashboardLink }) {
    console.log("AuthBox props:", isSession, dashboardLink);
    if (isSession) {
        return (
            <div className="auth-box">
                <div className="d-flex gap-2">
                    <Link to={dashboardLink} className="btn btn-nexa-outline btn-nexa-sm">Dashboard</Link>
                </div>
            </div>
        );
    }
    
    return (
    <div className="auth-box">
        <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-nexa-outline btn-nexa-sm">Log In</Link>
            <Link to="/register" className="btn btn-nexa btn-nexa-sm">Sign Up</Link>
        </div>
    </div>
  );
}