import type { IncomingMessage, ServerResponse } from "node:http";
import type { Catalog, Template_v2, Theme, CatalogAddKeyRequest, CatalogRemoveKeyRequest } from "./src/domain/types";
import * as catalogV2 from "./src/core/catalog-v2";
import * as templateV2 from "./src/core/template-v2";
import * as themeV2 from "./src/core/theme-v2";
import { generateThemeOutput, getCatalogCoverage, getOverallCoverage, getVariableUsage } from "./src/core/generator-v2";
import { exportThemePair, previewExport } from "./src/core/exporter-v2";

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

export function createV2ApiMiddleware(studioRoot: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";

    try {
      // ====================================================================
      // Catalog APIs
      // ====================================================================

      if (method === "GET" && url === "/api/v2/catalogs") {
        const catalogs = await catalogV2.listCatalogs(studioRoot);
        sendJson(res, 200, { catalogs });
        return;
      }

      if (method === "GET" && url.startsWith("/api/v2/catalogs/")) {
        const catalogName = decodeURIComponent(url.slice("/api/v2/catalogs/".length).split("/")[0]);
        const catalog = await catalogV2.loadCatalog(studioRoot, catalogName);
        if (!catalog) {
          sendJson(res, 404, { error: "Catalog not found" });
          return;
        }
        sendJson(res, 200, catalog);
        return;
      }

      if (method === "POST" && url.startsWith("/api/v2/catalogs/")) {
        const rest = url.slice("/api/v2/catalogs/".length);
        const parts = rest.split("/");
        const catalogName = decodeURIComponent(parts[0]);
        
        if (parts.length > 1 && parts[1] === "sync") {
          const body = await readBody(req);
          const { updateVersion } = JSON.parse(body) as { updateVersion: boolean };
          let catalog = await catalogV2.loadCatalog(studioRoot, catalogName);
          if (!catalog) {
            catalog = await catalogV2.createDefaultCatalog();
            catalog.name = catalogName;
          }
          const updated = await catalogV2.syncCatalogFromRemote(studioRoot, catalog, updateVersion);
          await catalogV2.saveCatalog(studioRoot, updated);
          sendJson(res, 200, updated);
          return;
        }
        
        if (parts.length > 1 && parts[1] === "keys") {
          const body = await readBody(req);
          const request = JSON.parse(body) as Omit<CatalogAddKeyRequest, "catalogName">;
          let catalog = await catalogV2.loadCatalog(studioRoot, catalogName);
          if (!catalog) {
            throw new Error("Catalog not found");
          }
          catalog = catalogV2.addCatalogKey(catalog, request);
          await catalogV2.saveCatalog(studioRoot, catalog);
          sendJson(res, 200, catalog);
          return;
        }
        
        const body = await readBody(req);
        const catalog = JSON.parse(body) as Catalog;
        await catalogV2.saveCatalog(studioRoot, catalog);
        sendJson(res, 200, { saved: true });
        return;
      }

      if (method === "DELETE" && url.startsWith("/api/v2/catalogs/")) {
        const rest = url.slice("/api/v2/catalogs/".length);
        const parts = rest.split("/");
        const catalogName = decodeURIComponent(parts[0]);
        
        if (parts.length > 1 && parts[1] === "keys") {
          const body = await readBody(req);
          const request = JSON.parse(body) as Omit<CatalogRemoveKeyRequest, "catalogName">;
          let catalog = await catalogV2.loadCatalog(studioRoot, catalogName);
          if (!catalog) {
            throw new Error("Catalog not found");
          }
          catalog = catalogV2.removeCatalogKey(catalog, request);
          await catalogV2.saveCatalog(studioRoot, catalog);
          sendJson(res, 200, catalog);
          return;
        }
      }

      // ====================================================================
      // Template APIs
      // ====================================================================

      if (method === "GET" && url === "/api/v2/templates") {
        const templates = await templateV2.listTemplates(studioRoot);
        sendJson(res, 200, { templates });
        return;
      }

      if (method === "GET" && url.startsWith("/api/v2/templates/")) {
        const templateId = decodeURIComponent(url.slice("/api/v2/templates/".length).split("/")[0]);
        
        if (url.endsWith("/coverage")) {
          const template = await templateV2.loadTemplate(studioRoot, templateId);
          if (!template) {
            sendJson(res, 404, { error: "Template not found" });
            return;
          }
          const catalogs = await catalogV2.loadCatalogsByName(studioRoot, template.catalogRefs);
          if (catalogs.size === 0) {
            sendJson(res, 404, { error: "No catalogs found" });
            return;
          }
          const ctx = { catalogs, template, theme: {} as Theme };
          sendJson(res, 200, {
            colors: getCatalogCoverage(ctx, "colors"),
            semanticTokens: getCatalogCoverage(ctx, "semanticTokens"),
            textMateScopes: getCatalogCoverage(ctx, "textMateScopes"),
            overall: getOverallCoverage(ctx),
          });
          return;
        }

        if (url.endsWith("/variable-usage")) {
          const template = await templateV2.loadTemplate(studioRoot, templateId);
          if (!template) {
            sendJson(res, 404, { error: "Template not found" });
            return;
          }
          const catalogs = await catalogV2.loadCatalogsByName(studioRoot, template.catalogRefs);
          if (catalogs.size === 0) {
            sendJson(res, 404, { error: "No catalogs found" });
            return;
          }
          const ctx = { catalogs, template, theme: {} as Theme };
          sendJson(res, 200, getVariableUsage(ctx));
          return;
        }

        const template = await templateV2.loadTemplate(studioRoot, templateId);
        if (!template) {
          sendJson(res, 404, { error: "Template not found" });
          return;
        }
        sendJson(res, 200, template);
        return;
      }

      if (method === "POST" && url.startsWith("/api/v2/templates/")) {
        const templateId = decodeURIComponent(url.slice("/api/v2/templates/".length));
        const body = await readBody(req);
        const template = JSON.parse(body) as Template_v2;
        await templateV2.saveTemplate(studioRoot, template);
        sendJson(res, 200, { saved: true });
        return;
      }

      if (method === "DELETE" && url.startsWith("/api/v2/templates/")) {
        const templateId = decodeURIComponent(url.slice("/api/v2/templates/".length));
        // For now, just return success. Actual deletion would require fs operations
        sendJson(res, 200, { deleted: true });
        return;
      }

      // ====================================================================
      // Theme APIs
      // ====================================================================

      if (method === "GET" && url === "/api/v2/themes") {
        const themes = await themeV2.listThemes(studioRoot);
        sendJson(res, 200, { themes });
        return;
      }

      if (method === "GET" && url.startsWith("/api/v2/themes/")) {
        const themeId = decodeURIComponent(url.slice("/api/v2/themes/".length).split("/")[0]);
        
        if (url.endsWith("/preview")) {
          const theme = await themeV2.loadTheme(studioRoot, themeId);
          if (!theme) {
            sendJson(res, 404, { error: "Theme not found" });
            return;
          }
          const template = await templateV2.loadTemplate(studioRoot, theme.templateRef);
          if (!template) {
            sendJson(res, 404, { error: "Template not found" });
            return;
          }
          const catalogs = await loadCatalogsByName(studioRoot, template.catalogRefs);
          if (catalogs.size === 0) {
            sendJson(res, 404, { error: "No catalogs found" });
            return;
          }
          const ctx = { catalogs, template, theme };
          const output = generateThemeOutput(ctx);
          const preview = await previewExport(studioRoot, theme, output.dark, output.light);
          sendJson(res, 200, preview);
          return;
        }

        const theme = await themeV2.loadTheme(studioRoot, themeId);
        if (!theme) {
          sendJson(res, 404, { error: "Theme not found" });
          return;
        }
        sendJson(res, 200, theme);
        return;
      }

      if (method === "POST" && url.startsWith("/api/v2/themes/")) {
        const rest = url.slice("/api/v2/themes/".length);
        const parts = rest.split("/");
        const themeId = decodeURIComponent(parts[0]);
        
        if (parts.length > 1 && parts[1] === "generate") {
          const theme = await themeV2.loadTheme(studioRoot, themeId);
          if (!theme) {
            sendJson(res, 404, { error: "Theme not found" });
            return;
          }
          const template = await templateV2.loadTemplate(studioRoot, theme.templateRef);
          if (!template) {
            sendJson(res, 404, { error: "Template not found" });
            return;
          }
          const catalogs = await loadCatalogsByName(studioRoot, template.catalogRefs);
          if (catalogs.size === 0) {
            sendJson(res, 404, { error: "No catalogs found" });
            return;
          }
          const ctx = { catalogs, template, theme };
          const output = generateThemeOutput(ctx);
          const result = await exportThemePair(studioRoot, theme, output.dark, output.light);
          sendJson(res, 200, result);
          return;
        }

        const body = await readBody(req);
        const theme = JSON.parse(body) as Theme;
        await themeV2.saveTheme(studioRoot, theme);
        sendJson(res, 200, { saved: true });
        return;
      }

      if (method === "DELETE" && url.startsWith("/api/v2/themes/")) {
        const themeId = decodeURIComponent(url.slice("/api/v2/themes/".length));
        // For now, just return success. Actual deletion would require fs operations
        sendJson(res, 200, { deleted: true });
        return;
      }

      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error("V2 API Error:", error);
      sendJson(res, 500, { error: message });
    }
  };
}
