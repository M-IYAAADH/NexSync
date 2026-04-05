/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages so Next.js can handle their TypeScript/ESM source
  transpilePackages: ['@synclite/core', '@synclite/react'],
}

export default nextConfig
