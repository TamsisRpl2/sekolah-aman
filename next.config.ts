import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
