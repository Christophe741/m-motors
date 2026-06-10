import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Helpers typés pour le client. `useUploadThing` permet de piloter l'upload
// depuis notre propre formulaire (on garde nos champs <input type="file">).
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
