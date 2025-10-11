/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow PropellerAds Domain
    experimental: {
        optimizePackageImports: ['react', 'react-dom'],
    },
    eslint: {
        // Ignore ESLint alerts in build
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;