import { proxyApi } from "./api-proxy.mjs";

// These values are server-only Vercel environment variables, never NEXT_PUBLIC_*.
export const handleRequest = (request: Request) => proxyApi(request, {
  origin: process.env.CAMPUS_API_ORIGIN,
  token: process.env.CAMPUS_API_SERVICE_TOKEN,
});
