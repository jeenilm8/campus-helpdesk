import { env } from "cloudflare:workers";
import { handleApi } from "./helpdesk.mjs";

export const handleRequest = (request: Request) => handleApi(request, env.DB);
