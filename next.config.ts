import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com"
      },
      {
        hostname: "avatar.iran.liara.run"
      },
      {
        hostname: "res.cloudinary.com"
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: "/auth",
        destination: "/auth/signin",
        permanent: false
      },
      {
        source: "/users",
        destination: "/users/teachers",
        permanent: false
      },
    ]
  }
};

export default nextConfig;
