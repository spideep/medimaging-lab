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

  app.get("/studies/:uid", async (_request, reply) => {
    try {
      return await getStudiesByUid(_request.id);
    } catch (error) {
      app.log.error({ err: error }, "Failed to retrieve DICOM studies");

      return reply.code(502).send({ error: "Unable to retrieve study" });
    }
  });
}
