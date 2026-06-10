import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Expose les routes GET/POST que le client UploadThing appelle.
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
