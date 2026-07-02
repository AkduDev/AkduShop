export function NotFoundIllustration() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="80" cy="80" r="72" className="fill-muted/50" />

      {/* Shopping bag body */}
      <path
        d="M50 65h60l8 70H42L50 65z"
        className="fill-muted stroke-muted-foreground/20"
        strokeWidth="2"
      />

      {/* Bag handles */}
      <path
        d="M62 65c0-12 8-22 18-22s18 10 18 22"
        className="stroke-muted-foreground/30"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Question mark */}
      <text
        x="80"
        y="105"
        textAnchor="middle"
        className="fill-muted-foreground/40"
        fontSize="28"
        fontWeight="bold"
      >
        ?
      </text>

      {/* Floating dots */}
      <circle cx="30" cy="45" r="3" className="fill-primary/20" />
      <circle cx="130" cy="50" r="4" className="fill-primary/15" />
      <circle cx="25" cy="110" r="2.5" className="fill-primary/10" />
      <circle cx="140" cy="105" r="3" className="fill-primary/20" />
    </svg>
  )
}
