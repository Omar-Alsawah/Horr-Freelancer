import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/** Returns uppercase initials from a user object, e.g. {firstName:"Mazen", lastName:"Yasser"} → "MY" */
function getInitials(user) {
  if (!user) return "?";
  const f = (user.firstName || "")[0] || "";
  const l = (user.lastName || "")[0] || "";
  return (f + l).toUpperCase();
}

export default function Navbar({ role = "client", user = null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const isMessages = location.pathname.toLowerCase().includes("messages");
  const isContracts = location.pathname.toLowerCase().includes("contracts");
  const initials = getInitials(user);

  return (
    <>
      <style>{`
        /* ── Navbar Styles ────────────────────────────────────────────────────
           Light theme. Matches the design screenshot (white bg, dark text,
           gold triangle logo, pill search bar, initials avatar circle).
        ──────────────────────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --nav-bg:       #ffffff;
          --nav-border:   #e8e8e8;
          --nav-text:     #1a1a1a;
          --nav-muted:    #555555;
          --nav-hover-bg: #f5f5f5;
          --nav-gold:     #C9A84C;
          --nav-height:   64px;
          --nav-font:     'DM Sans', system-ui, sans-serif;
        }

        .horr-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: var(--nav-height);
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          gap: 1.25rem;
          font-family: var(--nav-font);
        }

        /* ── Logo (placeholder) ──────────────────────────────────────────── */
        .horr-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
          cursor: pointer;
        }
        /* LOGO PLACEHOLDER: gold triangle SVG.
           TODO: Replace <svg> inside .horr-logo with your real logo asset */
        .horr-logo-triangle { width: 26px; height: 26px; flex-shrink: 0; }
        .horr-logo-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--nav-text);
          letter-spacing: 0.04em;
        }

        /* ── Center Nav ──────────────────────────────────────────────────── */
        .horr-nav-center {
          display: flex;
          align-items: center;
          gap: 0.1rem;
        }

        .horr-nav-item { position: relative; }

        .horr-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--nav-muted);
          background: none;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          text-decoration: none;
          font-family: var(--nav-font);
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
        }
        .horr-nav-link:hover,
        .horr-nav-link.active {
          color: var(--nav-text);
          background: var(--nav-hover-bg);
        }
        .horr-nav-link svg { transition: transform 0.18s; flex-shrink: 0; }
        .horr-nav-link.open svg { transform: rotate(180deg); }

        /* ── Dropdown ────────────────────────────────────────────────────── */
        .horr-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          padding: 8px 0.5rem 0.5rem;
          background: #fff;
          border: 1px solid #e0e0e0; 
          border-radius: 12px;
          min-width: 250px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.11);
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s, transform 0.18s;
          z-index: 200;
        }
        .horr-dropdown.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        .horr-dd-section-title {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #aaa;
          padding: 0.5rem 0.75rem 0.25rem;
        }
        .horr-dd-item {
          display: block;
          padding: 0.48rem 0.75rem;
          font-size: 0.875rem;
          color: var(--nav-text);
          text-decoration: none;
          border-radius: 7px;
          transition: background 0.12s;
        }
        .horr-dd-item:hover { background: var(--nav-hover-bg); }
        .horr-dd-divider {
          border: none;
          border-top: 1px solid #efefef;
          margin: 0.3rem 0;
        }

        /* ── Spacer ──────────────────────────────────────────────────────── */
        .horr-nav-spacer { flex: 1; }

        /* ── Right section ───────────────────────────────────────────────── */
        .horr-nav-right {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-shrink: 0;
        }

        /* Search pill */
        .horr-search {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #f7f7f7;
          border: 1px solid #e0e0e0;
          border-radius: 999px;
          padding: 0.42rem 1rem;
          width: 280px;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .horr-search:focus-within {
          background: #fff;
          border-color: var(--nav-gold);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }
        .horr-search svg { color: #bbb; flex-shrink: 0; }
        .horr-search input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--nav-font);
          font-size: 0.875rem;
          color: var(--nav-text);
        }
        .horr-search input::placeholder { color: #bbb; }

        /* Bell button */
        .horr-bell-btn {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #555;
          transition: background 0.15s;
        }
        .horr-bell-btn:hover { background: var(--nav-hover-bg); }

        /* Red dot */
        .horr-notif-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #e53935;
          border-radius: 50%;
          border: 1.5px solid #fff;
        }

        /* ── Avatar circle ─────────────────────────────────────────────────── */
        .horr-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid transparent;
          transition: border-color 0.15s, opacity 0.15s;
          user-select: none;
        }
        .horr-avatar:hover {
          border-color: var(--nav-gold);
          opacity: 0.88;
        }
        .horr-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
      `}</style>

      <nav className="horr-nav">

        {/* Logo */}
        <Link className="horr-logo" to="/client/dashboard">
          <svg className="horr-logo-triangle" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <polygon points="13,2 25,24 1,24" fill="#C9A84C" />
          </svg>
          <span className="horr-logo-name">HORR</span>
        </Link>

        {/* Center links */}
        <div className="horr-nav-center">

          {/* Hire talent dropdown - client only */}
          {role === "client" && (
            <div
              className="horr-nav-item"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className={`horr-nav-link ${dropdownOpen ? "open" : ""}`}>
                Hire talent
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1L5 5L9 1" />
                </svg>
              </button>

              <div className={`horr-dropdown ${dropdownOpen ? "visible" : ""}`}>
                <div className="horr-dd-section-title">Manage jobs and offers</div>
                <Link className="horr-dd-item" to="/client/job-proposals">Job proposals</Link>
                <hr className="horr-dd-divider" />
                <div className="horr-dd-section-title">Find freelancers</div>
                <Link className="horr-dd-item" to="/client/post-job">Post a job</Link>
                <Link className="horr-dd-item" to="/client/search-talent">Search for talent</Link>

                <Link className="horr-dd-item" to="/client/saved-talent">Talent you've saved</Link>
              </div>
            </div>
          )}

          {/* My Contracts link */}
          <Link
            className={`horr-nav-link ${isContracts ? "active" : ""}`}
            to="/client/contracts"
          >
            My Contracts
          </Link>

          {/* Messages link */}
          <Link
            className={`horr-nav-link ${isMessages ? "active" : ""}`}
            to="/client/messages"
          >
            Messages
          </Link>
        </div>

        {/* Spacer */}
        <div className="horr-nav-spacer" aria-hidden="true" />

        {/* Right section */}
        <div className="horr-nav-right">

          {/* Search bar */}
          <div className="horr-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Bell button */}
          <button className="horr-bell-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {user?.hasNotifications && (
              <span className="horr-notif-dot" aria-label="Unread notifications" />
            )}
          </button>

          {/* Avatar */}
          <div
            className="horr-avatar"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/client/settings")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/client/settings")}
            title={user ? `${user.firstName} ${user.lastName}` : "Profile"}
            aria-label="Go to profile settings"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}
