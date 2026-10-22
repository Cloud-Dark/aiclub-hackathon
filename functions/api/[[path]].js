import { handle } from "../../server/app.js";

export const onRequest = ({ request, env, waitUntil }) => handle(request, env, { waitUntil });
