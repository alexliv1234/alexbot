export default function BotCharacter() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Robot head */}
      <rect x="75" y="80" width="150" height="140" rx="15" fill="url(#botGradient)" stroke="#FFD700" strokeWidth="3"/>

      {/* Antenna */}
      <line x1="150" y1="80" x2="150" y2="50" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="150" cy="45" r="8" fill="#FFD700">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>

      {/* Eyes */}
      <circle cx="115" cy="130" r="15" fill="#00BCD4">
        <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="185" cy="130" r="15" fill="#00BCD4">
        <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite"/>
      </circle>

      {/* Pupils */}
      <circle cx="115" cy="130" r="6" fill="#1A1A2E"/>
      <circle cx="185" cy="130" r="6" fill="#1A1A2E"/>

      {/* Mouth - animated waveform */}
      <g className="bot-mouth">
        <path
          d="M 100 180 Q 125 165 150 180 T 200 180"
          stroke="#FFD700"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values="M 100 180 Q 125 165 150 180 T 200 180;
                    M 100 180 Q 125 195 150 180 T 200 180;
                    M 100 180 Q 125 165 150 180 T 200 180"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Body */}
      <rect x="90" y="230" width="120" height="60" rx="10" fill="url(#botGradient)" stroke="#FFD700" strokeWidth="2"/>

      {/* Chest panel */}
      <rect x="110" y="245" width="80" height="30" rx="5" fill="#1A1A2E" opacity="0.3"/>
      <circle cx="125" cy="260" r="4" fill="#00BCD4">
        <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="150" cy="260" r="4" fill="#4CAF50">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="175" cy="260" r="4" fill="#FF5252">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite"/>
      </circle>

      {/* Glow effect */}
      <defs>
        <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2A4E" />
          <stop offset="100%" stopColor="#1A1A2E" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Speech bubble indicator */}
      <g className="speech-indicator" opacity="0.8">
        <circle cx="230" cy="110" r="3" fill="#FFD700">
          <animate attributeName="cy" values="110;105;110" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="245" cy="100" r="5" fill="#FFD700">
          <animate attributeName="cy" values="100;95;100" dur="1s" begin="0.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="265" cy="95" r="7" fill="#FFD700">
          <animate attributeName="cy" values="95;90;95" dur="1s" begin="0.4s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}
