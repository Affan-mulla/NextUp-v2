import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images:{
    remotePatterns:[
      {
        protocol: "https",
        hostname:"fmevlxgidrhlfocswjlf.supabase.co",
        pathname: "/storage/v1/object/public/ideas/**"
      }
    ]
  }
};

export default nextConfig;
