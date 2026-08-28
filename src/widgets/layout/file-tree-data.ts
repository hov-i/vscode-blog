export type FileMeta = {
  id: string;
  label: string;
  icon: string;
  iconSize: number;
  path: string;
  route: string;
};

export type Row = {
  id: string;
  parentId?: string;
  kind: "folder" | "file";
  label: string;
  chevronLeft?: number;
  iconLeft: number;
  labelLeft: number;
  icon: string;
  iconW: number;
  iconH: number;
  badge?: { text: string; color: string };
  labelColor?: string;
  file?: FileMeta;
};

export type PostSummary = { id: number; title: string };
export type ProjectSummary = { id: number; title: string };
export type TagSummary = { id: number; name: string };

const DOC_ICON = "/icons/file-doc.svg";
const DOC_ICON_ACTIVE = "/icons/file-doc-accent.svg";
const FOLDER_ICON = "/icons/file-folder.svg";

export function buildPostFile(post: PostSummary): FileMeta {
  return {
    id: `post-${post.id}`,
    label: `${post.title}.md`,
    icon: DOC_ICON,
    iconSize: 16,
    path: `posts/${post.title}.md`,
    route: `/posts/${post.id}`,
  };
}

export function buildProjectFile(project: ProjectSummary): FileMeta {
  return {
    id: `project-${project.id}`,
    label: `${project.title}.md`,
    icon: DOC_ICON,
    iconSize: 16,
    path: `projects/${project.title}.md`,
    route: `/projects/${project.id}`,
  };
}

export function buildTagFile(tag: TagSummary): FileMeta {
  return {
    id: `tag-${tag.id}`,
    label: `${tag.name}.md`,
    icon: DOC_ICON,
    iconSize: 16,
    path: `tags/${tag.name}.md`,
    route: `/tags/${encodeURIComponent(tag.name)}`,
  };
}

export const WELCOME_FILE: FileMeta = {
  id: "welcome",
  label: "welcome.md",
  icon: DOC_ICON,
  iconSize: 16,
  path: "home/welcome.md",
  route: "/",
};

export const ABOUT_FILE: FileMeta = {
  id: "about",
  label: "about.md",
  icon: DOC_ICON,
  iconSize: 16,
  path: "home/about.md",
  route: "/about",
};

export const GUESTBOOK_FILE: FileMeta = {
  id: "guestbook",
  label: "guestbook.md",
  icon: DOC_ICON,
  iconSize: 16,
  path: "home/guestbook.md",
  route: "/guestbook",
};

export const TAGS_FILE: FileMeta = {
  id: "tags",
  label: "tags.md",
  icon: DOC_ICON,
  iconSize: 16,
  path: "home/tags.md",
  route: "/tags",
};

// The full flat list of files the tab/routing system needs to match a
// pathname against — home's static pages plus every real post, project, and
// tag (tag pages aren't shown in the Explorer tree, but still need a route
// match so a direct load doesn't fall through to the empty-editor state).
export function buildAllFiles({
  posts,
  projects,
  tags,
}: {
  posts: PostSummary[];
  projects: ProjectSummary[];
  tags: TagSummary[];
}): FileMeta[] {
  return [
    WELCOME_FILE,
    ABOUT_FILE,
    GUESTBOOK_FILE,
    TAGS_FILE,
    ...posts.map(buildPostFile),
    ...projects.map(buildProjectFile),
    ...tags.map(buildTagFile),
  ];
}

const HOME_FOLDER_ID = "folder-home";
const POSTS_FOLDER_ID = "folder-posts";
const PROJECTS_FOLDER_ID = "folder-projects";

const TOP_FOLDER = { chevronLeft: 18, iconLeft: 48, labelLeft: 72, iconW: 16, iconH: 14 };
const CHILD_FILE = { iconLeft: 60, labelLeft: 88, iconW: 16, iconH: 20 };

function fileRow(parentId: string, file: FileMeta): Row {
  return {
    id: `file-${file.id}`,
    parentId,
    kind: "file",
    label: file.label,
    ...CHILD_FILE,
    icon: file.icon,
    labelColor: "rgb(249,249,249)",
    file,
  };
}

// A search result row is a file row with no parentId — always visible,
// never nested — reusing the same child-file geometry so it lines up with
// how files look everywhere else in the tree.
export function buildSearchResultRow(file: FileMeta): Row {
  return {
    id: `search-${file.id}`,
    kind: "file",
    label: file.label,
    ...CHILD_FILE,
    icon: file.icon,
    labelColor: "rgb(249,249,249)",
    file,
  };
}

// Workspace root: home/ (welcome.md, about.md), posts/, projects/ — three
// top-level folders, each collapsible in the UI. See isRowVisible, which
// walks each row's parentId chain.
export function buildFileTreeRows({ posts, projects }: { posts: PostSummary[]; projects: ProjectSummary[] }): Row[] {
  const homeFolder: Row = { id: HOME_FOLDER_ID, kind: "folder", label: "home", icon: FOLDER_ICON, ...TOP_FOLDER };
  const postsFolder: Row = { id: POSTS_FOLDER_ID, kind: "folder", label: "posts", icon: FOLDER_ICON, ...TOP_FOLDER, badge: { text: String(posts.length), color: "rgb(96,205,255)" } };
  const projectsFolder: Row = { id: PROJECTS_FOLDER_ID, kind: "folder", label: "projects", icon: FOLDER_ICON, ...TOP_FOLDER, badge: { text: String(projects.length), color: "rgb(96,205,255)" } };

  // Each folder's children must sit immediately after it in the flat list —
  // the sidebar renders rows in array order, so grouping all files by
  // collection at the end (instead of interleaving per folder) would make
  // projects/ children render below every posts/ child instead of under
  // their own folder.
  return [
    homeFolder,
    fileRow(HOME_FOLDER_ID, WELCOME_FILE),
    fileRow(HOME_FOLDER_ID, ABOUT_FILE),
    fileRow(HOME_FOLDER_ID, GUESTBOOK_FILE),
    fileRow(HOME_FOLDER_ID, TAGS_FILE),
    postsFolder,
    ...posts.map((post) => fileRow(POSTS_FOLDER_ID, buildPostFile(post))),
    projectsFolder,
    ...projects.map((project) => fileRow(PROJECTS_FOLDER_ID, buildProjectFile(project))),
  ];
}

// posts/ and projects/ start collapsed (18+ entries is a lot to show up
// front); home/ starts open since it only holds the two static pages.
export const DEFAULT_COLLAPSED_FOLDER_IDS: string[] = [POSTS_FOLDER_ID, PROJECTS_FOLDER_ID];

// A row is hidden once any ancestor folder in its parentId chain is collapsed.
export function isRowVisible(row: Row, rows: Row[], collapsedFolderIds: Set<string>): boolean {
  let current = row;
  while (current.parentId) {
    if (collapsedFolderIds.has(current.parentId)) return false;
    const parent = rows.find((r) => r.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return true;
}

// .md files show the blue "open" doc icon only while their tab is active —
// used by both the file tree and the tab bar so the two stay in sync.
export function iconForFile(icon: string, active: boolean): string {
  if (icon !== DOC_ICON && icon !== DOC_ICON_ACTIVE) return icon;
  return active ? DOC_ICON_ACTIVE : DOC_ICON;
}
