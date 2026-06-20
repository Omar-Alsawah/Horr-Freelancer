/**
 * SkillTags
 * Renders a list of skill tags with optional experience level labels.
 * Overflows are collapsed into a "+N" pill.
 *
 * Props:
 *   skills: Array of { name: string, level: "Exp" | "Int" | "Beg" | null }
 *   max: number — how many tags to show before collapsing (default: 4)
 */
export default function SkillTags({ skills = [], max = 4 }) {
    if (!skills.length) return null;

    const visible = skills.slice(0, max);
    const overflow = skills.length - max;

    const levelColors = {
        Exp: { color: "#7a5c1e", bg: "#fdf8ee", border: "rgba(201,168,76,0.3)" },
        Int: { color: "#1565c0", bg: "#e8f0fe", border: "#90caf9" },
        Beg: { color: "#555", bg: "#f4f4f4", border: "#ddd" },
    };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {visible.map((skill, i) => {
                const lc = skill.level ? levelColors[skill.level] : null;
                return (
                    <span
                        key={i}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: "#f4f2ee",
                            border: "1px solid #e6e4df",
                            borderRadius: "6px",
                            padding: "0.28rem 0.65rem",
                            fontSize: "0.78rem",
                            color: "#1c1a17",
                            fontWeight: 500,
                        }}
                    >
                        {skill.name}
                        {skill.level && lc && (
                            <span
                                style={{
                                    background: lc.bg,
                                    color: lc.color,
                                    border: `1px solid ${lc.border}`,
                                    borderRadius: "4px",
                                    padding: "0.05rem 0.35rem",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {skill.level}
                            </span>
                        )}
                    </span>
                );
            })}

            {overflow > 0 && (
                <span
                    style={{
                        background: "#fdf8ee",
                        border: "1px solid rgba(201,168,76,0.3)",
                        borderRadius: "6px",
                        padding: "0.28rem 0.65rem",
                        fontSize: "0.78rem",
                        color: "#7a5c1e",
                        fontWeight: 600,
                    }}
                >
                    +{overflow}
                </span>
            )}
        </div>
    );
}