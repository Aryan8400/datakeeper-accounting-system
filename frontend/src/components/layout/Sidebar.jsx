import { NavLink } from "react-router-dom";
import { BUSINESS, NAV_ITEMS } from "../../utils/constants.js";
import NavIcon from "./NavIcon.jsx";

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
            <span className="text-sm font-bold">DK</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{BUSINESS.appName}</p>
            <p className="truncate text-xs text-slate-500">{BUSINESS.name}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-950/50 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              <NavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500">Contact</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{BUSINESS.contact}</p>
          <p className="mt-1 text-xs text-slate-400">{BUSINESS.type}</p>
        </div>
      </aside>
    </>
  );
}
