import { useEffect, useState } from "react";

const TOAST_FADE_MS = 220;

export default function Toast({
  toast,
  open,
  message,
  onClose,
  variant = "success",
  autoHideDuration = 2400,
}) {
  const resolvedOpen = Boolean(toast) || Boolean(open);
  const resolvedMessage = toast?.message || message || "";
  const resolvedVariant = toast?.type || variant;

  const [shouldRender, setShouldRender] = useState(resolvedOpen);
  const [isVisible, setIsVisible] = useState(resolvedOpen);

  useEffect(() => {
    if (resolvedOpen) {
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
  }, [resolvedOpen, shouldRender]);

  useEffect(() => {
    if (!resolvedOpen || !autoHideDuration) {
      return undefined;
    }

    const dismissTimer = setTimeout(() => {
      onClose?.();
    }, autoHideDuration);

    return () => clearTimeout(dismissTimer);
  }, [resolvedOpen, autoHideDuration, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`adm-toast adm-toast-${resolvedVariant} ${isVisible ? "is-visible" : "is-hidden"}`}
      role="status"
      aria-live="polite"
    >
      <div className="adm-toast-content">
        <i className="bi bi-check-circle-fill adm-toast-icon" aria-hidden="true"></i>
        <span className="adm-toast-message">{resolvedMessage}</span>
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
