import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (isAuthenticated) {
          setMessage("✓ Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        } else {
          setMessage("Email verification complete. Redirecting to login...");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1500);
        }
      }
    };

    checkAuth();
  }, [loading, isAuthenticated, navigate]);

  return (
    <AuthLayout title="Email Confirmed" subtitle="Your email has been verified">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-lg shadow-emerald-500/5 dark:border-emerald-900 dark:bg-emerald-950/20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <svg
              className="h-8 w-8 animate-pulse text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
        </div>
      </div>
    </AuthLayout>
  );
}
