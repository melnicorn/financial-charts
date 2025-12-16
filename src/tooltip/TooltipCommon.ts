export interface TooltipCommonProps {
  readonly className?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly origin?: [number, number] | ((width: number, height: number) => [number, number]);
  readonly onClick?: (event: React.MouseEvent, details?: any) => void;
  readonly background?: {
    fillStyle?: string;
    strokeStyle?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    className?: string;
  };
}

export const defaultTooltipCommonProps = {
  fontFamily: "-apple-system, system-ui, 'Helvetica Neue', Ubuntu, sans-serif",
  fontSize: 11,
  origin: [0, 0],
} as const;

export function generateTooltipBackgroundValues(
  fontSize: number,
  content: string | number | null = null,
  background?: TooltipCommonProps["background"],
): { x: number; y: number; width: number; height: number; fill: string; stroke: string } | null {
  if (!background) {
    return null;
  }

  const {
    fillStyle = "rgba(33, 33, 33, 0.7)",
    strokeStyle = "none",
    x,
    y,
    width,
    height
  } = background;

  let calculatedWidth = width;
  let calculatedHeight = height;

  if (calculatedWidth === undefined) {
    if (typeof content === "number") {
      calculatedWidth = content * fontSize;
    } else if (typeof content === "string") {
      calculatedWidth = content.length * fontSize * 0.5 + 20;
    } else {
      calculatedWidth = 0;
    }
  }

  if (calculatedHeight === undefined) {
    calculatedHeight = fontSize * 1.5;
  }

  return {
    x: x ?? 0,
    y: y ?? -fontSize - 2,
    width: calculatedWidth,
    height: calculatedHeight,
    fill: fillStyle,
    stroke: strokeStyle,
  };
}
