/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← Agrega esta línea
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig