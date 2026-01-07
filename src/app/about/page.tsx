"use client";

import { Icon } from "@/shared/ui/icon";
import Image from "next/image";

export default function ProfilePage() {
    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                 <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        MARKDOWN
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">about.md</span>
                </div>
                <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
                    About Me
                </h1>
                
                <div className="flex items-start gap-6 mb-8">
                     <div className="w-24 h-24 rounded-full bg-gray-400 overflow-hidden shrink-0">
                        <Image 
                            src="/avatar.jpeg" 
                            alt="Profile Picture" 
                            width={96} 
                            height={96} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                            윤홍비
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                            개발자로써 어떤 방식이 좋을 지 고민하고 더 나은 방향을 찾아 떠납니다.
    더 좋은 코드를 짜기 위해 프로젝트와 관련된 책을 찾아 읽고, 팀원과 소통하며 지식을 나누고 함께 고민하는 것을 좋아합니다.
    몸으로 부딪히면서 문제를 해결하고 지식을 습득하면서 빠르게 성장하고 있습니다.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon="github" label="GitHub" href="https://github.com/hov-i"/>
                            <SocialLink icon="velog" label="velog" href="https://velog.io/@dbsghdql555/posts" />
                            <a 
                                href="/resume.pdf" 
                                download 
                                className="flex items-center text-xs text-[var(--accent)] hover:underline"
                            >
                                <Icon name="download" className="w-3 h-3 mr-1" />
                                Resume
                            </a>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Section title="Experience">
                        <ExperienceItem 
                            role="STS팀 매니저"
                            company="(주) 지에스아이엘"
                            period="2024.05 - 현재"
                            description="React 및 Vue 3 기반 스마트 안전 B2B SaaS 플랫폼 프론트엔드 개발 및 유지보수"
                        />
                    </Section>

                    <Section title="Skills">
                         <div className="flex flex-wrap gap-2">
                            {['JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'Vue 3', 'Tailwind CSS', 'Vanilla Extract','styled-components', 'SCSS', 'Vite', 'MSW', 'Storybook', 'TanStack Query', 'Zustand'].map(skill => (
                                <span key={skill} className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                    {skill}
                                </span>
                            ))}
                         </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}

const SocialLink = ({ icon, label, href }: any) => (
    <button className="flex items-center text-xs text-[var(--accent)] hover:underline" onClick={() => window.open(href, '_blank')}  >
        <Icon name={icon as any} className="w-3 h-3 mr-1" />
        {label}
    </button>
)

const Section = ({ title, children }: any) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center">
            <span className="text-[var(--accent)] mr-2">##</span> {title}
        </h3>
        {children}
    </div>
)

const ExperienceItem = ({ role, company, period, description }: any) => (
    <div className="mb-4 pl-4 border-l border-[var(--border-color)]">
        <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">{role}</h4>
            <span className="text-xs text-[var(--text-secondary)]">{period}</span>
        </div>
        <div className="text-xs text-[var(--accent)] mb-1">{company}</div>
        <p className="text-xs text-[var(--text-secondary)]">{description}</p>
    </div>
)
