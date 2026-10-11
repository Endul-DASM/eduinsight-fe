import type { CSSProperties } from "react";

// At 100% the designs feel too large on laptop screens, so the app is scaled down like browser zoom: 90% for the
// sign-in pages and subject select, 80% inside a subject workspace.
export const APP_ZOOM = 0.9;
export const WORKSPACE_ZOOM = 0.8;

// zoom is set inline because the CSS build drops it from globals.css. --app-zoom lets full-height layouts
// (min-h-screen, see globals.css) scale 100vh back up to fill the screen.
export function zoomStyle(zoom: number, parentZoom = 1): CSSProperties {
  return { zoom: zoom / parentZoom, "--app-zoom": zoom } as CSSProperties;
}
