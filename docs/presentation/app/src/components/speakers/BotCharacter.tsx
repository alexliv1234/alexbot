export default function BotCharacter({
  isSpeaking = false,
}: {
  isSpeaking?: boolean;
}) {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC143C" />
          <stop offset="100%" stopColor="#B01030" />
        </linearGradient>
        <linearGradient id="jeansGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A5568" />
          <stop offset="100%" stopColor="#2D3748" />
        </linearGradient>
      </defs>

      {/* === LEGS (walking in place) === */}
      {/* Left leg */}
      <g>
        <rect x="120" y="215" width="22" height="55" rx="6" fill="url(#jeansGrad)">
          <animate
            attributeName="x"
            values="120;112;120;128;120"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Left shoe */}
        <rect x="116" y="266" width="30" height="14" rx="7" fill="#FFD700">
          <animate
            attributeName="x"
            values="116;108;116;124;116"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      {/* Right leg (opposite phase) */}
      <g>
        <rect x="158" y="215" width="22" height="55" rx="6" fill="url(#jeansGrad)">
          <animate
            attributeName="x"
            values="158;166;158;150;158"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Right shoe */}
        <rect x="154" y="266" width="30" height="14" rx="7" fill="#FFD700">
          <animate
            attributeName="x"
            values="154;162;154;146;154"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* === TORSO — Red Shazam T-shirt === */}
      <rect x="105" y="140" width="90" height="80" rx="12" fill="url(#shirtGrad)" />
      {/* Short sleeves */}
      <ellipse cx="100" cy="158" rx="14" ry="18" fill="#DC143C" />
      <ellipse cx="200" cy="158" rx="14" ry="18" fill="#DC143C" />

      {/* Lightning bolt */}
      <polygon
        points="145,150 155,150 148,170 158,170 140,195 146,178 136,178"
        fill="#FFD700"
      />

      {/* === LEFT ARM (relaxed at side) === */}
      <g>
        {/* Upper arm */}
        <rect x="78" y="155" width="16" height="40" rx="8" fill="#D4A574" />
        {/* Forearm */}
        <rect x="78" y="190" width="14" height="30" rx="7" fill="#D4A574" />
      </g>

      {/* === RIGHT ARM + MICROPHONE === */}
      <g
        style={{
          transition: "transform 0.4s ease-in-out",
          transformOrigin: "200px 158px",
          transform: isSpeaking ? "rotate(-55deg)" : "rotate(0deg)",
        }}
      >
        {/* Upper arm */}
        <rect x="206" y="155" width="16" height="40" rx="8" fill="#D4A574" />
        {/* Forearm */}
        <rect x="208" y="190" width="14" height="30" rx="7" fill="#D4A574" />
        {/* Hand */}
        <circle cx="215" cy="222" r="8" fill="#D4A574" />
        {/* Microphone handle */}
        <rect x="212" y="222" width="6" height="28" rx="3" fill="#555" />
        {/* Microphone head */}
        <ellipse cx="215" cy="252" rx="10" ry="12" fill="#333">
          <animate
            attributeName="ry"
            values="12;13;12"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* Mic grille lines */}
        <line x1="208" y1="248" x2="222" y2="248" stroke="#666" strokeWidth="1" />
        <line x1="207" y1="252" x2="223" y2="252" stroke="#666" strokeWidth="1" />
        <line x1="208" y1="256" x2="222" y2="256" stroke="#666" strokeWidth="1" />
      </g>

      {/* === HEAD === */}
      <ellipse cx="150" cy="90" rx="48" ry="52" fill="#D4A574" />

      {/* Hair — swept back with volume */}
      <path
        d="M102,75 Q110,30 150,25 Q190,30 198,75 Q195,50 170,38 Q150,32 130,38 Q108,50 102,75Z"
        fill="#2C1810"
      />
      {/* Hair sides */}
      <path d="M102,75 Q98,65 100,85 Q103,78 102,75Z" fill="#2C1810" />
      <path d="M198,75 Q202,65 200,85 Q197,78 198,75Z" fill="#2C1810" />

      {/* === GLASSES — thick black rectangular frames === */}
      <rect
        x="115"
        y="76"
        width="30"
        height="24"
        rx="4"
        fill="none"
        stroke="#000"
        strokeWidth="3.5"
      />
      <rect
        x="155"
        y="76"
        width="30"
        height="24"
        rx="4"
        fill="none"
        stroke="#000"
        strokeWidth="3.5"
      />
      {/* Bridge */}
      <line x1="145" y1="86" x2="155" y2="86" stroke="#000" strokeWidth="3" />
      {/* Temples */}
      <line x1="115" y1="82" x2="104" y2="78" stroke="#000" strokeWidth="2.5" />
      <line x1="185" y1="82" x2="196" y2="78" stroke="#000" strokeWidth="2.5" />

      {/* === EYES — cyan behind glasses === */}
      <circle cx="130" cy="88" r="8" fill="#00BCD4">
        <animate
          attributeName="r"
          values="8;9;8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="170" cy="88" r="8" fill="#00BCD4">
        <animate
          attributeName="r"
          values="8;9;8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {/* Pupils */}
      <circle cx="130" cy="88" r="3.5" fill="#1A1A2E" />
      <circle cx="170" cy="88" r="3.5" fill="#1A1A2E" />

      {/* === BEARD — salt and pepper === */}
      <path
        d="M115,105 Q115,135 150,140 Q185,135 185,105"
        fill="#3E2723"
        opacity="0.9"
      />
      {/* Gray streaks in beard */}
      <path
        d="M125,110 Q128,128 140,132"
        stroke="#B0B0B0"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M165,112 Q168,126 158,133"
        stroke="#B0B0B0"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M175,108 Q177,122 168,130"
        stroke="#B0B0B0"
        strokeWidth="2.5"
        fill="none"
        opacity="0.5"
      />

      {/* === MOUTH — gold waveform inside beard === */}
      <path
        d="M130,118 Q140,112 150,118 T170,118"
        stroke="#FFD700"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      >
        <animate
          attributeName="d"
          values="M130,118 Q140,112 150,118 T170,118;
                  M130,118 Q140,125 150,118 T170,118;
                  M130,118 Q140,112 150,118 T170,118"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </path>

      {/* === SPEECH BUBBLES — 3 gold circles === */}
      <g opacity="0.8">
        <circle cx="210" cy="60" r="4" fill="#FFD700">
          <animate
            attributeName="cy"
            values="60;55;60"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="225" cy="48" r="6" fill="#FFD700">
          <animate
            attributeName="cy"
            values="48;43;48"
            dur="1s"
            begin="0.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="245" cy="40" r="8" fill="#FFD700">
          <animate
            attributeName="cy"
            values="40;35;40"
            dur="1s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}
