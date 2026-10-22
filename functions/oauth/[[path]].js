import { handleOAuth } from "../../server/oauth.js";

export const onRequest = ({ request, env }) => handleOAuth(request, env);
