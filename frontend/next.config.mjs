/** @type {import('next').NextConfig} */
const nextConfig = {
    // ✅ Proxy ALL /api/* requests to the backend.
    // Next.js App Router route handlers (src/app/api/**) take priority over these rewrites
    // for routes they define. For any /api/* URL that doesn't have a local handler, 
    // this proxies to the backend.
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3001/api/:path*',
            },
        ];
    },
};

export default nextConfig;
