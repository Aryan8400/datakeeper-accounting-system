import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      signup({ name: form.name, email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Register to start using DataKeeper">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}
        <Input label="Full Name" id="name" value={form.name} onChange={update("name")} placeholder="Your full name" required />
        <Input label="Email" id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" required />
        <Input label="Password" id="password" type="password" value={form.password} onChange={update("password")} placeholder="Min. 6 characters" required />
        <Input
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          placeholder="Re-enter password"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
