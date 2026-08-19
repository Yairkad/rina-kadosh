import { useId } from "react";

type Motif = "circle" | "up" | "down" | "left" | "right";

const GRID: Motif[][] = [
  ["right", "left", "circle", "down"],
  ["down", "circle", "up", "left"],
  ["circle", "up", "right", "circle"],
  ["left", "down", "circle", "right"],
];

function motifPath(motif: Exclude<Motif, "circle">, c: number): string {
  switch (motif) {
    case "up":
      return `M0,${c} A${c / 2},${c / 2} 0 0 1 ${c},${c} Z`;
    case "down":
      return `M0,0 A${c / 2},${c / 2} 0 0 0 ${c},0 Z`;
    case "left":
      return `M${c},0 A${c / 2},${c / 2} 0 0 0 ${c},${c} Z`;
    case "right":
      return `M0,0 A${c / 2},${c / 2} 0 0 1 0,${c} Z`;
  }
}

interface GeometricPatternProps {
  className?: string;
  color?: string;
  opacity?: number;
  size?: number;
  strokeWidth?: number;
}

/** Semicircle/circle grid pattern recreated in code from ATAR/Asset 3@2x.png (outline "orbit" grid) — same visual language, scalable and tintable instead of a raster trace. */
export function GeometricPattern({
  className,
  color = "currentColor",
  opacity = 1,
  size = 60,
  strokeWidth = 1.5,
}: GeometricPatternProps) {
  const rawId = useId();
  const patternId = `geo-pattern-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const tile = size * GRID[0].length;

  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={tile} height={tile}>
          <g opacity={opacity} fill="none" stroke={color} strokeWidth={strokeWidth}>
            {GRID.map((row, rowIndex) =>
              row.map((motif, colIndex) => (
                <g
                  key={`${rowIndex}-${colIndex}`}
                  transform={`translate(${colIndex * size},${rowIndex * size})`}
                >
                  {motif === "circle" ? (
                    <circle cx={size / 2} cy={size / 2} r={size / 2 - strokeWidth / 2} />
                  ) : (
                    <path d={motifPath(motif, size)} />
                  )}
                </g>
              ))
            )}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
