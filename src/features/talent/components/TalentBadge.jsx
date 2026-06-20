/**
 * TalentBadge
 * Displays a verification or achievement badge next to the freelancer name.
 *
 * Props:
 *   type: "verified" | "top-rated" | "rising-talent"
 */
export default function TalentBadge({ type }) {
    if (!type) return null;

    const configs = {
        verified: {
            label: "Verified",
            color: "#2e7d32",
            bg: "#f0faf0",
            border: "#a5d6a7",
            icon: (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ),
        },
        "top-rated": {
            label: "Top Rated",
            color: "#7a5c1e",
            bg: "#fdf8ee",
            border: "rgba(201,168,76,0.35)",
            icon: (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            ),
        },
        "rising-talent": {
            label: "Rising Talent",
            color: "#1565c0",
            bg: "#e8f0fe",
            border: "#90caf9",
            icon: (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                </svg>
            ),
        },
    };

    const config = configs[type];
    if (!config) return null;

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.border}`,
                borderRadius: "5px",
                padding: "0.18rem 0.5rem",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
            }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}