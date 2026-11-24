import Fastify from "fastify";
import { studiesRoutes } from "./routes/studies.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(studiesRoutes, {
    prefix: "/api",
  });

  return app;
}
