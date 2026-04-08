import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/base.css';
import './css/auth.css';
import './css/booking.css';
import './css/confirmation.css';
import './css/dashboard.css';
import './css/details.css';
import './css/search.css';
import './css/admin.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// fetch("http://localhost:5000/api/test")
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error(`Request failed with status ${response.status}`);
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log("backend says:", data.message);
//   })
//   .catch((error) => {
//     console.error("Failed to reach /api/test:", error);
//   });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
