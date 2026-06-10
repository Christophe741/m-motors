import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const f = createUploadthing();

// Routeur de fichiers UploadThing : un seul "endpoint" pour les justificatifs
// d'un dossier (PDF ou image). L'auth est vérifiée côté serveur dans le
// middleware AVANT que l'upload ne soit autorisé.
export const ourFileRouter = {
  justificatif: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 4 },
    image: { maxFileSize: "8MB", maxFileCount: 4 },
    text: { maxFileSize: "8MB", maxFileCount: 4 },
  })
    .middleware(async () => {
      const token = (await cookies()).get("mmotors_token")?.value;
      const user = token ? await verifyToken(token) : null;
      if (!user) {
        throw new UploadThingError("Non autorisé");
      }
      // Ce qui est retourné ici est disponible dans onUploadComplete (metadata).
      return { userId: user.sub };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Exécuté sur le serveur une fois l'upload terminé. La valeur retournée
      // est renvoyée au client (callback onClientUploadComplete).
      return { uploadedBy: metadata.userId, url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
