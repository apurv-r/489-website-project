import { useEffect, useState } from "react";

const TOAST_FADE_MS = 220;

export default function AdminToast({
  open,
  message,
  onClose,
  variant = "success",
  autoHideDuration = 2400,
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const frameId = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frameId);
    }

    if (!shouldRender) {
      return undefined;
    }

    setIsVisible(false);
    const hideTimer = setTimeout(() => {
      setShouldRender(false);
    }, TOAST_FADE_MS);

    return () => clearTimeout(hideTimer);
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open || !autoHideDuration) {
      return undefined;
    }

    const dismissTimer = setTimeout(() => {
      onClose?.();
    }, autoHideDuration);

    return () => clearTimeout(dismissTimer);
  }, [open, autoHideDuration, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`adm-toast adm-toast-${variant} ${isVisible ? "is-visible" : "is-hidden"}`}
      role="status"
      aria-live="polite"
    >
      <div className="adm-toast-content">
        <i className="bi bi-check-circle-fill adm-toast-icon" aria-hidden="true"></i>
        <span className="adm-toast-message">{message}</span>
      </div>
      <button
        type="button"
        className="adm-toast-dismiss"
        aria-label="Dismiss notification"
        onClick={() => onClose?.()}
      >
        <i className="bi bi-x-lg" aria-hidden="true"></i>
      </button>
    </div>
  );
}
