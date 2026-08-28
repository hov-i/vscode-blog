// Real vector icons extracted from the Figma file tree (design-system/project/figma/assets).
export const FOLDER_ICON = { src: "/icons/file-folder.svg", width: 16, height: 14 };

export function getDocIcon(active: boolean) {
  return active
    ? { src: "/icons/file-doc-accent.svg", width: 16, height: 20 }
    : { src: "/icons/file-doc.svg", width: 16, height: 20 };
}
