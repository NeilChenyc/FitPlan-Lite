/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
