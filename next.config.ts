import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost', '192.168.1.16', '192.168.1.16:3000', 'localhost:3000']
};

export default nextConfig;
