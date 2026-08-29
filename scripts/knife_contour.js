import fs from 'fs';

// Let's create a SVG path with smooth spline points along the butterfly knife silhouette
// The knife in CS2 butterfly Marble Fade has a characteristic shape:
// - Blade tip at top right (tilted ~35 deg)
// - Curved curved blade belly with serrated spine notches
// - Double pivot ring & tang pins
// - Dual split butterfly handles with oval cutouts
// - Base latch at the bottom left

const svgContent = `
<svg viewBox="0 0 500 1000" fill="none" xmlns="http://www.w3.org/2000/svg" class="hero-knife-contour-svg">
  <defs>
    <linearGradient id="knifeLaserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE072" />
      <stop offset="30%" stop-color="#FF6B4A" />
      <stop offset="70%" stop-color="#E8583A" />
      <stop offset="100%" stop-color="#FF2A14" />
    </linearGradient>
    <filter id="knifeLaserGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  {/* Векторный контур ножа-бабочки */}
  <path
    d="M485 55 
       C475 75, 455 115, 435 155
       C415 195, 395 240, 375 285
       L365 310
       C360 325, 345 350, 340 375
       L335 400
       C330 420, 320 435, 310 450
       L295 470
       C285 485, 275 510, 265 540
       L240 610
       C220 665, 195 730, 170 795
       L145 860
       C130 900, 115 940, 95 975
       C85 990, 65 995, 50 985
       C35 975, 35 955, 45 935
       C60 900, 80 855, 100 810
       L130 740
       C150 690, 175 635, 195 585
       L215 530
       C225 505, 235 480, 240 455
       L245 425
       C250 405, 245 385, 240 370
       L235 345
       C240 330, 255 315, 270 300
       L305 265
       C340 225, 380 180, 415 135
       C440 100, 465 70, 485 55 Z"
    className="hero-knife-laser-path"
  />
</svg>
`;

console.log('Contour definition ready');
