import icons from "./fig-icon-data";

interface FigIconProps {
  name: keyof typeof icons;
  size?: number | string;
  className?: string;
}

// Renders the literal vector geometry extracted from the Figma icon component
// sets (design-system/project/figma/icon-data.js), ported as-is.
export function FigIcon({ name, size = 16, className }: FigIconProps) {
  const d = icons[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox={d.viewBox}
      fill="none"
      className={className}
      // body strings are emitter-controlled <path> markup — geometry,
      // numeric fills and transforms only; no user-authored text reaches them.
      dangerouslySetInnerHTML={{ __html: d.body }}
    />
  );
}
