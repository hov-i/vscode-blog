import { ABOUT_CONTENT } from "@/shared/lib/content/static-pages";
import { DocPreviewSplit } from "@/widgets/doc-preview/doc-preview-split";

export default function AboutPage() {
  return <DocPreviewSplit doc={{ title: "about", path: "home/about.md", content: ABOUT_CONTENT }} />;
}
