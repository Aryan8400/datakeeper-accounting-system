import { BUSINESS } from "../utils/constants.js";
import logo from "../assets/logo_datakeeper.png";

/** Shared layout for login & signup pages */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 px-6 py-10 sm:px-10 lg:px-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="DataKeeper logo"
              className="h-20 w-20 md:h-24 md:w-24 object-contain shadow-sm"
            />
            <div>
              <p className="text-lg font-bold text-white">{BUSINESS.appName}</p>
              <p className="text-xs text-brand-300">{BUSINESS.name}</p>
            </div>
          </div>
          <div className="mt-10 hidden max-w-md lg:block">
            <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              Smart accounting for <span className="text-brand-300">Jasta Patta</span> trade
            </h1>
            <p className="mt-4 text-slate-400">
              Track metal sheet inventory, record sales in KG, manage dues, and view profit reports — all in one place.
            </p>
          </div>
        </div>
        <p className="relative z-10 mt-8 hidden text-sm text-slate-500 lg:block">
          {BUSINESS.contact} · {BUSINESS.type}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950 sm:px-10 lg:max-w-xl lg:px-14 xl:max-w-2xl">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{BUSINESS.appName}</p>
            <p className="text-sm text-slate-500">{BUSINESS.name}</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
