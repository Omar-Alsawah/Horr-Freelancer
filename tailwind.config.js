export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo:   ['Cairo', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'Cairo', 'sans-serif'],
      },
      colors: {
        /* shadcn/ui HSL tokens — keep for component library compatibility */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",

        /* ── HORR BRAND TOKENS ─────────────────────────────── */
        navy:          "var(--color-primary-navy)",
        gold:          "var(--color-primary-gold)",
        "gold-dark":   "var(--color-gold-dark)",
        "gold-light":  "var(--color-gold-light)",

        /* ── SURFACE ───────────────────────────────────────── */
        "surface-base":   "var(--color-surface-base)",
        "surface-subtle": "var(--color-surface-subtle)",
        "surface-muted":  "var(--color-surface-muted)",

        /* ── TEXT ──────────────────────────────────────────── */
        "text-main":      "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted":     "var(--color-text-muted)",
        "text-inverse":   "var(--color-text-inverse)",
        "text-accent":    "var(--color-text-accent)",

        /* ── SEMANTIC STATUS ───────────────────────────────── */
        "success-bg":   "var(--color-success-bg)",
        "success-text": "var(--color-success-text)",
        "warning-bg":   "var(--color-warning-bg)",
        "warning-text": "var(--color-warning-text)",
        "danger-bg":    "var(--color-danger-bg)",
        "danger-text":  "var(--color-danger-text)",
        "info-bg":      "var(--color-info-bg)",
        "info-text":    "var(--color-info-text)",
        "neutral-bg":   "var(--color-neutral-bg)",
        "neutral-text": "var(--color-neutral-text)",
      },
      borderRadius: {
        /* shadcn default tokens */
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /* Horr design radius tokens */
        "horr-sm":   "var(--radius-sm)",
        "horr-md":   "var(--radius-md)",
        "horr-lg":   "var(--radius-lg)",
        "horr-xl":   "var(--radius-xl)",
        "horr-pill": "var(--radius-pill)",
      },
      boxShadow: {
        card:          "var(--shadow-card)",
        "card-hover":  "var(--shadow-card-hover)",
        modal:         "var(--shadow-modal)",
        dropdown:      "var(--shadow-dropdown)",
        gold:          "var(--shadow-gold)",
      },
      fontSize: {
        "display":   ["var(--text-display)",  { lineHeight: "1.25" }],
        "h1":        ["var(--text-h1)",        { lineHeight: "1.25" }],
        "h2":        ["var(--text-h2)",        { lineHeight: "1.375" }],
        "h3":        ["var(--text-h3)",        { lineHeight: "1.375" }],
        "h4":        ["var(--text-h4)",        { lineHeight: "1.375" }],
        "body-lg":   ["var(--text-body-lg)",   { lineHeight: "1.5" }],
        "body":      ["var(--text-body)",      { lineHeight: "1.5" }],
        "body-sm":   ["var(--text-body-sm)",   { lineHeight: "1.5" }],
        "label":     ["var(--text-label)",     { lineHeight: "1.375" }],
        "caption":   ["var(--text-caption)",   { lineHeight: "1.5" }],
        "mono":      ["var(--text-mono)",      { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
