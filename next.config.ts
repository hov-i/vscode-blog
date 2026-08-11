import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    // 배럴 파일 import를 개별 모듈로 치환해 클라이언트 번들에서 미사용 아이콘 제거
    optimizePackageImports: ['react-icons', 'lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
