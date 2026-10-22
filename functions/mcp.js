import { handleMcp } from "../server/mcp.js";

export const onRequest = ({ request, env }) => handleMcp(request, env);
