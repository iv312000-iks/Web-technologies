export default function YabroLogo({ size = 56 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="56" height="56" rx="4" fill="white" fillOpacity="0.08" />
      <text
        x="4"
        y="24"
        fontFamily="Manrope, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="white"
      >
        YU
      </text>
      <text
        x="4"
        y="44"
        fontFamily="Manrope, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="white"
      >
        TB
      </text>
    </svg>
  );
}
