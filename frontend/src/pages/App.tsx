import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import AIAssistantWidget from "../components/AIAssistantWidget";
import { AssistantProvider } from "../contexts/AssistantContext";
import { isAuthenticated, logout as doLogout, getUser } from "../utils/auth";

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: string;
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons = {
  home: (
    <svg {...iconProps}>
      <path d="M3 10.5 12 4l9 6.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9Z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  ),
  dashboard: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="6" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  group: (
    <svg {...iconProps}>
      <path d="M17 21v-2a3 3 0 0 0-3-3H10a3 3 0 0 0-3 3v2" />
      <circle cx="12" cy="8" r="3" />
      <path d="M21 21v-2a3 3 0 0 0-2-2.82" />
      <path d="M5 16.18A3 3 0 0 0 3 19v2" />
      <path d="M19 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      <path d="M9 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    </svg>
  ),
  bell: (
    <svg {...iconProps}>
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17a2 2 0 0 1-.6 1.42L4 17h5" />
      <path d="M13 21a1 1 0 0 1-2 0" />
    </svg>
  ),
  user: (
    <svg {...iconProps}>
      <path d="M18 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logout: (
    <svg {...iconProps}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
    </svg>
  ),
  menu: (
    <svg {...iconProps}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  close: (
    <svg {...iconProps}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  ),
};

const vendorNav: NavItem[] = [
  { label: "Home", path: "/", icon: icons.home },
  { label: "Dashboard", path: "/dashboard", icon: icons.dashboard },
  {
    label: "Customers",
    path: "/vendor/customers",
    icon: icons.group,
    badge: "Live",
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: icons.bell,
  },
  { label: "Profile", path: "/profile", icon: icons.user },
];

const vendorRoutePrefixes = [
  "/dashboard",
  "/vendor",
  "/notifications",
  "/profile",
];

const getBreadcrumbLabel = (segment: string) => {
  if (!segment) return "";
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInitials = (value?: string | null) => {
  if (!value) return "";
  const parts = value.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState<string | null>(
    () => getUser()?.role ?? null
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useMemo(() => getUser(), [location.pathname]);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setUserRole(user?.role ?? null);
    setMenuOpen(false);
  }, [location.pathname, user?.role]);

  const isVendor = authed && userRole === "vendor";
  const onVendorRoute =
    isVendor &&
    vendorRoutePrefixes.some((prefix) => location.pathname.startsWith(prefix));

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Overview";
    return segments.map(getBreadcrumbLabel).join(" · ");
  }, [location.pathname]);

  const activeNav = useMemo(() => {
    return (
      vendorNav.find((item) => location.pathname.startsWith(item.path)) ?? null
    );
  }, [location.pathname]);

  const initials = useMemo(() => {
    if (!user) return "";
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const fromName = getInitials(name);
    if (fromName) {
      return fromName;
    }
    return getInitials(user.email ?? "");
  }, [user]);

  const handleLogout = () => {
    doLogout();
    setAuthed(false);
    setUserRole(null);
    navigate("/login");
  };

  const shouldShowAssistant = authed && userRole === "vendor" && !menuOpen;

  const renderVendorShell = () => (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? icons.close : icons.menu}
      </button>

      <div className="vendor-shell">
        <aside className={`vendor-rail ${menuOpen ? "is-open" : ""}`}>
          <div className="vendor-rail__logo">
            <span className="vendor-rail__logo-dot" />
            <span>Smart AI</span>
          </div>
          <nav className="vendor-rail__nav">
            <span className="vendor-rail__section-title">Navigation</span>
            {vendorNav.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`vendor-rail__item ${
                    isActive ? "vendor-rail__item--active" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="vendor-rail__badge">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="vendor-rail__footer">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>AI Agent</div>
            Live mock responses with automated tool simulations.
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="vendor-rail__item"
            style={{ marginTop: "auto" }}
          >
            {icons.logout}
            <span>Logout</span>
          </button>
        </aside>

        <section className="vendor-shell__main">
          <header className="vendor-topbar">
            <div className="vendor-topbar__title">
              <span className="vendor-topbar__breadcrumbs">{breadcrumbs}</span>
              <h1 className="vendor-topbar__heading">
                {activeNav?.label ?? "Workspace"}
              </h1>
            </div>
            <div className="vendor-topbar__actions">
              <div className="vendor-command">
                <span>Search or jump to...</span>
                <span className="vendor-command__hint">⌘K</span>
              </div>
              <div className="vendor-avatar">{initials || "AI"}</div>
            </div>
          </header>

          <main id="main-content" className="vendor-content">
            <Outlet />
          </main>
        </section>
      </div>

      {shouldShowAssistant ? <AIAssistantWidget /> : null}
    </div>
  );

  return (
    <AssistantProvider>
      {onVendorRoute ? (
        renderVendorShell()
      ) : (
        <div className="app-shell" style={{ width: "100%" }}>
          {shouldShowAssistant ? <AIAssistantWidget /> : null}
          <main id="main-content" style={{ width: "100%" }}>
            <Outlet />
          </main>
        </div>
      )}
    </AssistantProvider>
  );
}
