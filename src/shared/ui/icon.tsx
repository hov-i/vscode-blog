"use client";

import { cn } from "@/shared/lib/utils";
import {
  Code2,
  Menu,
  Home,
  FileText,
  Search,
  Settings,
  User,
  Users,
  Tags,
  Moon,
  Sun,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Wifi,
  Bell,
  CheckCircle,
  FolderOpen,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Github,
  X,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Clock,
  Trash2,
  LogIn,
  LogOut,
  Book,
  Loader2,
  Download,
  Send
} from "lucide-react";

export const Icons = {
  logo: Code2,
  menu: Menu,
  home: Home,
  posts: FileText,
  files: FileText,
  explorer: FolderOpen,
  search: Search,
  tags: Tags,
  user: User,
  users: Users,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  more: MoreHorizontal,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  gitBranch: GitBranch,
  check: CheckCircle,
  wifi: Wifi,
  bell: Bell,
  calendar: Calendar,
  eye: Eye,
  comment: MessageSquare,
  messageSquare: MessageSquare,
  star: Star,
  github: Github,
  close: X,
  fileCode: FileCode,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  clock: Clock,
  trash: Trash2,
  folder: FolderOpen,
  logIn: LogIn,
  logOut: LogOut,
  velog: Book,
  loading: Loader2,
  loader: Loader2,
  download: Download,
  send: Send
};

export type IconKey = keyof typeof Icons;

interface IconProps extends React.ComponentProps<"svg"> {
  name: IconKey;
}

export function Icon({ name, className, ...props }: IconProps) {
  const LucideIcon = Icons[name];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon className={cn("w-4 h-4", className)} {...props} />;
}
