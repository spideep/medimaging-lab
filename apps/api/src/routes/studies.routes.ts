import type { FastifyInstance } from "fastify";
import {
  getStudies,
  getStudiesByUid,
  StudyNotFoundError,
} from "../clients/dicomweb.client.js";

export async function studiesRoutes(app: FastifyInstance) {
  app.get("/studies", async (_request, reply) => {
    try {
      return await getStudies();
    } catch (error) {
      app.log.error({ err: error }, "Failed to retrieve DICOM studies");

      return reply.code(502).send({ error: "Unable to retrieve studies" });
    }
  });

  app.get<{ Params: { uid: string } }>(
    "/studies/:uid",
    async (request, reply) => {
      const { uid } = request.params;

      const validUid =
        uid.length <= 64 && /^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/.test(uid);

      if (!validUid) {
        return reply.code(400).send({ error: "Invalid StudyInstanceUID" });
      }

      try {
        return await getStudiesByUid(uid);
      } catch (error) {
        if (error instanceof StudyNotFoundError) {
          return reply.code(402).send({ error: "Study not found" });
        }

        app.log.error({ err: error }, "Failed to retrieve DICOM study");

        return reply.code(502).send({
          error: "Unable to retrieve study",
        });
      }
    },
  );
}
