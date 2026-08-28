// vscode-layout.tsx scales the whole shell down with Tailwind's `scale-90` —
// any drag-to-resize handle must divide its mouse deltas by this so the
// dragged edge tracks the cursor 1:1 on screen.
export const ZOOM_SCALE = 0.9;
