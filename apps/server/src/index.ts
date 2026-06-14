import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.js";

const app = express();

app.use(
  "/trpc",
  createExpressMiddleware({ router: appRouter })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
