import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AuthBox({ isSession, onAuthAction }) {
    const navigate = useNavigate();

    async function handleLogout(e) {
        e.preventDefault();
        // Call logout API
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, 
            { withCredentials: true })
            .then(response => {
                if (response.status === 204) {
                    console.log("successfully logged out");
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                onAuthAction?.('logout');
                window.dispatchEvent(new Event('auth-changed'));
                navigate("/login");
            });
    }

    if (isSession) {
        return (
            <div className="auth-box">
                <div className="d-flex gap-2">
                    <Link
                        to="/"
                        className="btn btn-nexa-outline btn-nexa-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="auth-box">
            <div className="d-flex gap-2">
                <Link
                    to="/login"
                    className="btn btn-nexa-outline btn-nexa-sm"
                    onClick={() => onAuthAction?.('login')}
                >
                    Log In
                </Link>
                <Link
                    to="/register"
                    className="btn btn-nexa btn-nexa-sm"
                    onClick={() => onAuthAction?.('register')}
                >
                    Sign Up
                </Link>
            </div>
        </div>
    );
}