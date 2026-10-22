import { wellKnown } from "../../server/oauth.js";

export const onRequest = ({ request }) => wellKnown(request);
