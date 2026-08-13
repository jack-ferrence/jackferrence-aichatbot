export function AtlasIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 3 28 27H21.5L16 15.5 10.5 27H4L16 3Z"
        fill="url(#atlas-icon-gradient)"
      />
      <path
        d="M12.4 20 16 12.6 19.6 20H12.4Z"
        fill="url(#atlas-icon-gradient-2)"
        opacity="0.9"
      />
      <defs>
        <linearGradient
          id="atlas-icon-gradient"
          x1="4"
          y1="3"
          x2="28"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4c86ff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient
          id="atlas-icon-gradient-2"
          x1="12.4"
          y1="12.6"
          x2="19.6"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#4c86ff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
