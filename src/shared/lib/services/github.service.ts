import pkg from "../../../../package.json";

const REPO = "hov-i/vscode-blog";
const REVALIDATE_SECONDS = 3600;

export interface GithubInfo {
    updatedAt: string | null;
    version: string;
}

export async function getGithubInfo(): Promise<GithubInfo> {
    const headers: HeadersInit = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [repoRes, releaseRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${REPO}`, {
            headers,
            next: { revalidate: REVALIDATE_SECONDS },
        }).catch(() => null),
        fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
            headers,
            next: { revalidate: REVALIDATE_SECONDS },
        }).catch(() => null),
    ]);

    let updatedAt: string | null = null;
    if (repoRes?.ok) {
        const repo = await repoRes.json();
        updatedAt = repo.pushed_at ?? null;
    }

    let version = `v${pkg.version}`;
    if (releaseRes?.ok) {
        const release = await releaseRes.json();
        if (release.tag_name) {
            version = release.tag_name.startsWith("v")
                ? release.tag_name
                : `v${release.tag_name}`;
        }
    }

    return { updatedAt, version };
}
