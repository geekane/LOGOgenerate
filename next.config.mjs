/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
          {
            protocol: 'https',
            hostname: 'sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com',
          },
       ],
    },
  };
  
export default nextConfig;