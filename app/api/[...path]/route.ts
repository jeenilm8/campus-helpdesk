import { env } from "cloudflare:workers";
import { handleApi } from "@/lib/helpdesk.mjs";
export const dynamic = "force-dynamic";
const handler = (request: Request) => handleApi(request, env.DB);
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
