import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import Toast from "../../components/Toast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function numberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [serviceFee, setServiceFee] = useState(10);
  const [minListingPrice, setMinListingPrice] = useState(5);
  const [maxPhotosPerListing, setMaxPhotosPerListing] = useState(12);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/platform-settings`, {
          withCredentials: true,
        });

        if (!isMounted) {
          return;
        }

        const data = response.data || {};
        setServiceFee(numberOrFallback(data.serviceFee, 10));
        setMinListingPrice(numberOrFallback(data.minListingPrice, 5));
        setMaxPhotosPerListing(numberOrFallback(data.maxPhotosPerListing, 12));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setToast({
          type: "error",
          message: error.response?.data?.message || "Failed to load platform settings.",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSaveSettings() {
    try {
      setSaving(true);

      const payload = {
        serviceFee: numberOrFallback(serviceFee, 10),
        minListingPrice: numberOrFallback(minListingPrice, 5),
        maxPhotosPerListing: numberOrFallback(maxPhotosPerListing, 12),
      };

      const response = await axios.patch(`${API_BASE_URL}/api/platform-settings`, payload, {
        withCredentials: true,
      });

      const data = response.data || {};
      setServiceFee(numberOrFallback(data.serviceFee, payload.serviceFee));
      setMinListingPrice(numberOrFallback(data.minListingPrice, payload.minListingPrice));
      setMaxPhotosPerListing(
        numberOrFallback(data.maxPhotosPerListing, payload.maxPhotosPerListing),
      );

      setToast({ type: "success", message: "Platform settings saved." });
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to save platform settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-layout">
      <AdminSidebar />
      <main className="adm-main">
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Settings</h1>
            <p className="adm-page-sub">Platform-wide controls used across the marketplace.</p>
          </div>
        </div>

        <div className="adm-card" style={{ maxWidth: 700 }}>
          <h3 className="adm-card-title" style={{ marginBottom: "1rem" }}>
            Platform Settings
          </h3>

          {loading ? (
            <div style={{ color: "var(--nexa-gray-500)", fontSize: "0.9rem" }}>
              Loading settings…
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Service Fee (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={serviceFee}
                  onChange={(event) => setServiceFee(event.target.value)}
                  style={{
                    width: 180,
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "var(--nexa-gray-900)",
                    color: "var(--nexa-gray-200)",
                    fontSize: "0.875rem",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Minimum Listing Price (USD/day)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={minListingPrice}
                  onChange={(event) => setMinListingPrice(event.target.value)}
                  style={{
                    width: 180,
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "var(--nexa-gray-900)",
                    color: "var(--nexa-gray-200)",
                    fontSize: "0.875rem",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Max Photos Per Listing
                </span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={maxPhotosPerListing}
                  onChange={(event) => setMaxPhotosPerListing(event.target.value)}
                  style={{
                    width: 180,
                    padding: "0.5rem 0.75rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "var(--nexa-gray-900)",
                    color: "var(--nexa-gray-200)",
                    fontSize: "0.875rem",
                  }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button className="btn btn-nexa" onClick={handleSaveSettings} disabled={saving}>
                  <i className="bi bi-save2 me-2"></i>
                  {saving ? "Saving…" : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
