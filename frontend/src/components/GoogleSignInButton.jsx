import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const GOOGLE_SCRIPT_ID = "google-identity-services";

const GoogleSignInButton = ({ onCredential, disabled = false }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) {
            toast.error("Google sign-in failed. Please try again.");
            return;
          }

          await onCredential(response.credential);
        },
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        text: "continue_with",
        shape: "pill",
        size: "large",
        width: 320,
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [onCredential]);

  if (!clientId) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className="btn btn-outline w-full"
          onClick={() => toast.error("Set VITE_GOOGLE_CLIENT_ID in frontend/.env and restart Vite")}
        >
          Continue with Google
        </button>
        <p className="text-xs text-base-content/60 text-center">
          Google Sign-In is not configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleSignInButton;
