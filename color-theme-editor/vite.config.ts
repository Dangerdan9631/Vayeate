import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateThemePair } from "./src/core/generator";
import { exportThemePair } from "./src/core/exporter";
import type { ThemeTemplate } from "./src/domain/types";

const TEMPLATE_FILE_PATTERN = /^[a-z0-9-]+\.template\.json$/;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json");
  response.end(`${JSON.stringify(payload)}\n`);
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function normalizeTemplateFileName(rawName: string): string {
  const decoded = decodeURIComponent(rawName).trim().toLowerCase();
  if (!TEMPLATE_FILE_PATTERN.test(decoded)) {
    throw new Error("Template file name must match <name>.template.json");
  }
  return decoded;
}

async function ensureTemplateSchema(template: ThemeTemplate): Promise<void> {
  if (template.schemaVersion !== 1) {
    throw new Error("Unsupported template schemaVersion");
  }
  if (!template.id || !template.name || !template.variables || !Array.isArray(template.bindings)) {
    throw new Error("Invalid template payload");
  }
}

function themeStudioApiPlugin() {
  const studioRoot = __dirname;
  const templatesDir = path.resolve(studioRoot, "templates");

  return {
    name: "theme-studio-api",
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";

        if (req.method === "GET" && url === "/api/templates") {
          try {
            await fs.mkdir(templatesDir, { recursive: true });
            const files = (await fs.readdir(templatesDir)).filter((file) => TEMPLATE_FILE_PATTERN.test(file)).sort();
            sendJson(res, 200, { templates: files });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to list templates";
            sendJson(res, 500, { error: message });
          }
          return;
        }

        if (req.method === "GET" && url.startsWith("/api/templates/")) {
          try {
            const fileName = normalizeTemplateFileName(url.slice("/api/templates/".length));
            const targetPath = path.join(templatesDir, fileName);
            const raw = await fs.readFile(targetPath, "utf8");
            const template = JSON.parse(raw) as ThemeTemplate;
            sendJson(res, 200, { fileName, template });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to load template";
            sendJson(res, 404, { error: message });
          }
          return;
        }

        if (req.method === "POST" && url.startsWith("/api/templates/")) {
          try {
            const fileName = normalizeTemplateFileName(url.slice("/api/templates/".length));
            const rawBody = await readBody(req);
            const template = JSON.parse(rawBody) as ThemeTemplate;
            await ensureTemplateSchema(template);

            await fs.mkdir(templatesDir, { recursive: true });
            await fs.writeFile(path.join(templatesDir, fileName), `${JSON.stringify(template, null, 2)}\n`, "utf8");
            sendJson(res, 200, { fileName, saved: true });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save template";
            sendJson(res, 400, { error: message });
          }
          return;
        }

        if (req.method === "POST" && url === "/api/generate") {
          try {
            const rawBody = await readBody(req);
            const payload = JSON.parse(rawBody) as { template: ThemeTemplate };
            await ensureTemplateSchema(payload.template);

            const generated = generateThemePair(payload.template);
            const result = await exportThemePair(studioRoot, payload.template, generated);

            sendJson(res, 200, {
              generated: true,
              darkPath: result.darkPath,
              lightPath: result.lightPath,
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Generation failed";
            sendJson(res, 400, { error: message });
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), themeStudioApiPlugin()],
  server: {
    fs: {
      allow: [".."],
    },
  },
});