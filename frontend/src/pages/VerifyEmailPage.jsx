import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { resendConfirmationEmail } from "../services/supabaseService.js";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "your email address";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  async function handleResend() {
    setResendError("");
    setResendMessage("");
    setResendLoading(true);
    try {
      await resendConfirmationEmail(email);
      setResendMessage("Verification email sent. Check your inbox.");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendError(err.message || "Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle="Complete registration by confirming your address">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-700/5 dark:border-slate-700 dark:bg-slate-950/90">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a confirmation link to <span className="font-medium text-slate-900 dark:text-white">{email}</span>.
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Open the email and click the verification link. After the link opens, return to the login page and sign in.
        </p>
        {resendMessage && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            {resendMessage}
          </div>
        )}
        {resendError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {resendError}
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full" variant="secondary">
              Back to sign in
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
            className="text-sm font-semibold"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
