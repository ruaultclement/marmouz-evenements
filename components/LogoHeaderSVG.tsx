export function LogoHeaderSVG() {
  return (
    <svg viewBox="0 0 1200 400" className="w-full h-auto" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="1200" height="400" fill="#F5EBE0"/>
      
      {/* Title text: "La guinguette des" */}
      <text x="100" y="140" fontFamily="cursive, italic" fontSize="70" fontStyle="italic" fill="#2F5D50" fontWeight="300" letterSpacing="-2">
        La guinguette des
      </text>
      
      {/* Main text: "MARMOUZ" with outline style */}
      <text x="100" y="280" fontFamily="Arial, sans-serif" fontSize="120" fontWeight="900" fill="none" stroke="#D94A4A" strokeWidth="5" letterSpacing="4">
        MARMOUZ
      </text>
      <text x="100" y="280" fontFamily="Arial, sans-serif" fontSize="120" fontWeight="900" fill="#F5EBE0" letterSpacing="4">
        MARMOUZ
      </text>
      
      {/* Character (monkey/person) with glass */}
      <g transform="translate(1000, 100)">
        {/* Head */}
        <circle cx="0" cy="0" r="40" fill="#2F5D50"/>
        {/* Face lighter */}
        <circle cx="0" cy="0" r="35" fill="#4A7A6D"/>
        
        {/* Eyes */}
        <circle cx="-15" cy="-10" r="7" fill="#F5EBE0"/>
        <circle cx="15" cy="-10" r="7" fill="#F5EBE0"/>
        <circle cx="-15" cy="-10" r="3" fill="#2F5D50"/>
        <circle cx="15" cy="-10" r="3" fill="#2F5D50"/>
        
        {/* Mouth */}
        <path d="M -8 8 Q 0 14 8 8" stroke="#2F5D50" strokeWidth="2" fill="none"/>
        
        {/* Body */}
        <ellipse cx="0" cy="55" rx="32" ry="50" fill="#2F5D50"/>
        
        {/* Arms */}
        <ellipse cx="-40" cy="35" rx="14" ry="40" fill="#2F5D50" transform="rotate(-25 -40 35)"/>
        <ellipse cx="40" cy="35" rx="14" ry="40" fill="#2F5D50" transform="rotate(25 40 35)"/>
        
        {/* Glass in right hand */}
        <g transform="translate(60, 0)">
          <path d="M 0 30 L 8 0 L 18 0 L 28 30 Z" fill="#D94A4A" opacity="0.85" stroke="#8B3A3A" strokeWidth="1"/>
          <ellipse cx="14" cy="0" rx="8" ry="4" fill="#D94A4A" opacity="0.6"/>
          <path d="M 8 12 L 18 12 Z" stroke="#F5EBE0" strokeWidth="1"/>
          {/* Drink inside */}
          <path d="M 2 30 L 5 15 L 23 15 L 26 30 Z" fill="#E8B4B4" opacity="0.5"/>
        </g>
      </g>
    </svg>
  );
}
