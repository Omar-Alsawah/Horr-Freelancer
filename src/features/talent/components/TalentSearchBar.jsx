/**
 * TalentSearchBar
 * Search input + filter button.
 * Fully controlled — parent owns the state.
 *
 * Props:
 *   value:        string           — current search value
 *   onChange:     (val) => void    — called on input change
 *   onFilter:     () => void       — called when filter button is clicked
 *   placeholder:  string           — input placeholder (optional)
 */
export default function TalentSearchBar({
    value = "",
    onChange,
    onFilter,
    placeholder = "Search for talent...",
}) {
    return (
        <>
            <style>{`
        .tsb-wrap {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .tsb-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 999px;
          padding: 0.75rem 1.5rem;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .tsb-input-wrap:focus-within {
          border-color: #C9A84C;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }
        .tsb-input-wrap svg {
          color: #ccc;
          flex-shrink: 0;
        }
        .tsb-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          font-family: inherit;
          background: transparent;
          color: #1c1a17;
        }
        .tsb-input::placeholder { color: #ccc; }

        .tsb-filter-btn {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #888;
          flex-shrink: 0;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .tsb-filter-btn:hover {
          border-color: #C9A84C;
          color: #C9A84C;
          background: #fdf8ee;
        }
      `}</style>

            <div className="tsb-wrap">
                <div className="tsb-input-wrap">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="tsb-input"
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                    {value && (
                        <button
                            onClick={() => onChange?.("")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9a9590", display: "flex", padding: 0 }}
                            aria-label="Clear search"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>

                <button className="tsb-filter-btn" onClick={onFilter} aria-label="Filter results">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                        <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                </button>
            </div>
        </>
    );
}