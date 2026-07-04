import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url)).replace(/[/\\]scripts$/, "");

const args = parseArgs(process.argv.slice(2));
const entry = args.entry ?? "src";
const includeOnly = args["include-only"] ?? "^src";
const mode = args.mode ?? "module";
const outFile = args.out ?? (mode === "architecture" ? "architecture-graph.html" : "dependency-graph.html");

const architectureParentColors = {
  app: "#3867d6",
  domain: "#20bf6b",
  gateway: "#eb3b5a",
  model: "#f7b731",
};

const architectureSubLayerColors = {
  actions: "#45aaf2",
  components: "#8854d0",
  controllers: "#fa8231",
  viewmodel: "#4b7bec",
  core: "#778ca3",
  operations: "#20bf6b",
  validations: "#26de81",
  state: "#2bcbba",
  utils: "#fed330",
  gateway: "#eb3b5a",
  services: "#fc5c65",
  model: "#a55eea",
};

const architectureLayerColors = buildArchitectureLayerColors();

const moduleLayerColors = {
  app: "#3867d6",
  domain: "#20bf6b",
  gateway: "#eb3b5a",
  model: "#f7b731",
  other: "#778ca3",
};

const depcruiseBin = join(rootDir, "node_modules", "dependency-cruiser", "bin", "dependency-cruise.mjs");
if (!existsSync(depcruiseBin)) {
  throw new Error("dependency-cruiser is not installed. Run npm install before building the dependency graph.");
}

const cruise = spawnSync(
  process.execPath,
  [
    depcruiseBin,
    entry,
    "--include-only",
    includeOnly,
    "--output-type",
    "json",
    "--output-to",
    "-",
    "--no-config",
  ],
  {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 128,
  },
);

if (cruise.status !== 0) {
  process.stderr.write(cruise.stderr);
  process.stderr.write(cruise.stdout);
  process.exit(cruise.status ?? 1);
}

const cruiseOutput = JSON.parse(cruise.stdout);
const graph = mode === "architecture"
  ? buildArchitectureGraph(cruiseOutput.modules)
  : buildModuleGraph(cruiseOutput.modules);

const cytoscapeSource = readFileSync(
  join(rootDir, "node_modules", "cytoscape", "dist", "cytoscape.min.js"),
  "utf8",
);

const html = renderHtml({
  cytoscapeSource,
  graph,
  mode,
  entry,
  layerColors: mode === "architecture" ? architectureLayerColors : moduleLayerColors,
  generatedAt: new Date().toISOString(),
});

const outputPath = join(rootDir, outFile);
writeFileSync(outputPath, html);

console.log(`Wrote ${relative(rootDir, outputPath)} with ${graph.stats.nodes} nodes and ${graph.stats.edges} edges.`);

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index];
    if (!current.startsWith("--")) {
      continue;
    }

    const [key, inlineValue] = current.slice(2).split("=");
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = rawArgs[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
      continue;
    }

    parsed[key] = true;
  }

  return parsed;
}

function buildModuleGraph(modules) {
  const moduleSources = new Set(modules.map((module) => normalizePath(module.source)));
  const nodes = modules.map((module) => {
    const source = normalizePath(module.source);

    return {
      data: {
        id: source,
        label: basename(source),
        path: source,
        layer: getLayer(source),
        dependencyCount: module.dependencies.length,
        dependentCount: module.dependents.length,
        orphan: module.orphan,
      },
    };
  });

  const edges = [];
  for (const module of modules) {
    const source = normalizePath(module.source);
    for (const dependency of module.dependencies) {
      const target = normalizePath(dependency.resolved);
      if (!moduleSources.has(target)) {
        continue;
      }

      edges.push({
        data: {
          id: `${source}->${target}`,
          source,
          target,
          dependencyTypes: dependency.dependencyTypes.join(", "),
          circular: dependency.circular,
        },
      });
    }
  }

  return {
    elements: [...nodes, ...edges],
    stats: {
      nodes: nodes.length,
      edges: edges.length,
    },
  };
}

function buildArchitectureGraph(modules) {
  const topLayerNodesById = new Map();
  const domainNodesById = new Map();
  const nodesById = new Map();
  const edgeCounts = new Map();

  for (const module of modules) {
    const source = getArchitectureLayer(module.source);
    if (source === "other") {
      continue;
    }

    const sourceTopLayer = getArchitectureTopLayer(source);
    const sourceDomain = getArchitectureDomain(source);
    const sourceSubLayer = getArchitectureSubLayer(source);
    const sourceTopLayerParentId = getArchitectureTopLayerParentId(sourceTopLayer);
    const sourceDomainParentId = getArchitectureDomainParentId(sourceTopLayer, sourceDomain);
    if (!topLayerNodesById.has(sourceTopLayerParentId)) {
      topLayerNodesById.set(sourceTopLayerParentId, {
        data: {
          id: sourceTopLayerParentId,
          label: sourceTopLayer,
          path: sourceTopLayer,
          layer: sourceTopLayer,
          kind: "top-layer",
        },
      });
    }
    if (!domainNodesById.has(sourceDomainParentId)) {
      domainNodesById.set(sourceDomainParentId, {
        data: {
          id: sourceDomainParentId,
          label: sourceDomain,
          path: `${sourceTopLayer}/${sourceDomain}`,
          layer: sourceTopLayer,
          parent: sourceTopLayerParentId,
          kind: "domain",
        },
      });
    }

    if (!nodesById.has(source)) {
      nodesById.set(source, {
        id: source,
        label: source,
        path: source,
        layer: sourceSubLayer,
        parent: sourceDomainParentId,
        kind: "architecture",
        moduleCount: 0,
      });
    }

    nodesById.get(source).moduleCount += 1;

    for (const dependency of module.dependencies) {
      if (!dependency.resolved) {
        continue;
      }

      const target = getArchitectureLayer(dependency.resolved);
      if (source === target || target === "other") {
        continue;
      }

      const edgeId = `${source}->${target}`;
      edgeCounts.set(edgeId, {
        id: edgeId,
        source,
        target,
        count: (edgeCounts.get(edgeId)?.count ?? 0) + 1,
        circular: Boolean(edgeCounts.get(edgeId)?.circular || dependency.circular),
      });
    }
  }

  const nodes = [...nodesById.values()].map((node) => ({
    data: {
      ...node,
      label: `${node.label} (${node.moduleCount})`,
    },
  }));

  const edges = [...edgeCounts.values()].map((edge) => ({
    data: {
      ...edge,
      dependencyTypes: `${edge.count} imports`,
    },
  }));

  return {
    elements: [...topLayerNodesById.values(), ...domainNodesById.values(), ...nodes, ...edges],
    stats: {
      nodes: nodes.length,
      edges: edges.length,
    },
  };
}

function normalizePath(path) {
  return (path ?? "").replaceAll("\\", "/");
}

function basename(path) {
  return normalizePath(path).split("/").at(-1);
}

function getArchitectureLayer(path) {
  const normalized = normalizePath(path);
  const parts = normalized.split("/");
  const domainNames = new Set(["Common", "Catalog", "Template", "Theme"]);

  if (parts[0] === "src" && parts[1] === "app" && ["actions", "components", "controllers", "viewmodel", "core"].includes(parts[2]) && domainNames.has(parts[3])) {
    return `${parts[1]}/${parts[2]}/${parts[3]}`;
  }
  if (parts[0] === "src" && parts[1] === "domain" && ["operations", "validations", "state", "utils", "core"].includes(parts[2]) && domainNames.has(parts[3])) {
    return `${parts[1]}/${parts[2]}/${parts[3]}`;
  }
  if (parts[0] === "src" && parts[1] === "gateway" && ["gateway", "services"].includes(parts[2]) && domainNames.has(parts[3])) {
    return `${parts[1]}/${parts[2]}/${parts[3]}`;
  }
  if (parts[0] === "src" && parts[1] === "model" && domainNames.has(parts[2])) {
    return `model/${parts[2]}`;
  }

  return "other";
}

function getArchitectureTopLayer(layer) {
  return normalizePath(layer).split("/")[0];
}

function getArchitectureDomain(layer) {
  return normalizePath(layer).split("/").at(-1);
}

function getArchitectureSubLayer(layer) {
  const parts = normalizePath(layer).split("/");
  return parts.length === 2 ? parts[0] : parts[1];
}

function getArchitectureTopLayerParentId(topLayer) {
  return `layer:${topLayer}`;
}

function getArchitectureDomainParentId(topLayer, domain) {
  return `layer:${topLayer}:${domain}`;
}

function buildArchitectureLayerColors() {
  return {
    other: "#778ca3",
    ...architectureSubLayerColors,
  };
}

function getLayer(path) {
  const normalized = normalizePath(path);
  if (normalized.startsWith("src/app/")) return "app";
  if (normalized.startsWith("src/domain/")) return "domain";
  if (normalized.startsWith("src/gateway/")) return "gateway";
  if (normalized.startsWith("src/model/")) return "model";
  return "other";
}

function renderHtml({ cytoscapeSource, graph, mode, entry, layerColors, generatedAt }) {
  const graphJson = JSON.stringify(graph.elements);
  const layerColorsJson = JSON.stringify(layerColors);
  const parentColorsJson = JSON.stringify(architectureParentColors);
  const legendItems = Object.entries(layerColors)
    .filter(([layer]) => layer !== "other")
    .map(([layer, color]) => `<span class="legend-item"><span class="swatch" style="background:${color}"></span>${escapeHtml(layer)}</span>`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vayeate Theme Studio Dependency Graph</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        --border: #cfd7df;
        --text: #1e2933;
        --muted: #65758b;
        --panel: #f7f9fb;
      }

      body {
        margin: 0;
        color: var(--text);
        background: #ffffff;
      }

      .toolbar {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(220px, 1fr) auto auto auto auto auto;
        gap: 12px;
        align-items: center;
        min-height: 64px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
        background: var(--panel);
      }

      .title {
        min-width: 0;
      }

      h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.3;
      }

      .meta {
        margin-top: 2px;
        color: var(--muted);
        font-size: 12px;
      }

      input {
        box-sizing: border-box;
        width: min(360px, 28vw);
        height: 36px;
        padding: 0 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
        font: inherit;
        font-size: 13px;
        background: #ffffff;
      }

      button {
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text);
        font: inherit;
        font-size: 13px;
        background: #ffffff;
        cursor: pointer;
      }

      button:hover {
        background: #edf2f7;
      }

      .segmented-control {
        display: inline-flex;
        overflow: hidden;
        height: 36px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: #ffffff;
      }

      .segmented-control button {
        height: 34px;
        border: 0;
        border-right: 1px solid var(--border);
        border-radius: 0;
        background: transparent;
      }

      .segmented-control button:last-child {
        border-right: 0;
      }

      .segmented-control button[aria-pressed="true"] {
        color: #ffffff;
        background: #1e2933;
      }

      .segmented-control button[aria-pressed="true"]:hover {
        background: #1e2933;
      }

      .group-menu {
        position: relative;
      }

      .group-menu summary {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: #ffffff;
        cursor: pointer;
        font-size: 13px;
      }

      .group-panel {
        position: absolute;
        z-index: 10;
        right: 0;
        display: grid;
        grid-template-columns: repeat(2, max-content);
        gap: 6px;
        max-height: min(520px, calc(100vh - 92px));
        min-width: 360px;
        overflow: auto;
        margin-top: 6px;
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: #ffffff;
        box-shadow: 0 12px 28px rgba(30, 41, 51, 0.16);
      }

      .group-panel button {
        justify-content: flex-start;
        height: 30px;
        padding: 0 8px;
        font-size: 12px;
        text-align: left;
      }

      .group-panel button[aria-pressed="true"] {
        color: #ffffff;
        background: #8b1e3f;
        border-color: #8b1e3f;
      }

      .legend {
        display: flex;
        gap: 10px;
        align-items: center;
        color: var(--muted);
        font-size: 12px;
      }

      .legend-item {
        display: inline-flex;
        gap: 5px;
        align-items: center;
      }

      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 999px;
      }

      #graph {
        width: 100vw;
        height: calc(100vh - 64px);
      }

      @media (max-width: 860px) {
        .toolbar {
          grid-template-columns: 1fr;
        }

        input {
          width: 100%;
        }

        #graph {
          height: calc(100vh - 172px);
        }
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="title">
        <h1>${escapeHtml(mode === "architecture" ? "Architecture Dependency Graph" : "Module Dependency Graph")}</h1>
        <div class="meta">${escapeHtml(entry)} | ${graph.stats.nodes} nodes | ${graph.stats.edges} edges | ${escapeHtml(generatedAt)}</div>
      </div>
      <input id="search" type="search" placeholder="Filter by path or filename" />
      <div class="segmented-control" role="group" aria-label="Dependency direction">
        <button type="button" data-direction="both" aria-pressed="true">Both</button>
        <button type="button" data-direction="inbound" aria-pressed="false">Inbound</button>
        <button type="button" data-direction="outbound" aria-pressed="false">Outbound</button>
      </div>
      <div class="segmented-control" role="group" aria-label="Scroll zoom speed">
        <button type="button" data-zoom-speed="0.36" aria-pressed="false">1x</button>
        <button type="button" data-zoom-speed="0.72" aria-pressed="true">2x</button>
        <button type="button" data-zoom-speed="1.08" aria-pressed="false">3x</button>
      </div>
      <details class="group-menu">
        <summary>Groups</summary>
        <div id="groupFilters" class="group-panel" aria-label="Hidden groups"></div>
      </details>
      <button id="fit" type="button">Fit</button>
      <div class="legend" aria-label="Layer legend">
        ${legendItems}
      </div>
    </div>
    <div id="graph"></div>
    <script>${cytoscapeSource}</script>
    <script>
      const elements = ${graphJson};
      const layerColors = ${layerColorsJson};
      const parentColors = ${parentColorsJson};
      let dependencyDirection = "both";
      let zoomSpeed = 0.72;
      let activeSelection = null;
      const hiddenGroupIds = new Set();

      const cy = cytoscape({
        container: document.getElementById("graph"),
        elements,
        minZoom: 0.05,
        maxZoom: 4,
        wheelSensitivity: zoomSpeed,
        style: [
          {
            selector: "node",
            style: {
              "background-color": (node) => layerColors[node.data("layer")] || parentColors[node.data("layer")] || layerColors.other,
              "border-color": "#ffffff",
              "border-width": 1,
              "color": "#1e2933",
              "font-size": 20,
              "height": (node) => node.data("moduleCount") ? Math.min(64, 24 + node.data("moduleCount")) : 18,
              "label": "data(label)",
              "overlay-padding": 6,
              "text-background-color": "#ffffff",
              "text-background-opacity": 0.86,
              "text-background-padding": 2,
              "text-max-width": 100,
              "text-wrap": "wrap",
              "width": (node) => node.data("moduleCount") ? Math.min(64, 24 + node.data("moduleCount")) : 18,
            },
          },
          {
            selector: "node[kind = 'top-layer']",
            style: {
              "background-color": (node) => parentColors[node.data("layer")] || layerColors.other,
              "background-opacity": 0.08,
              "border-color": (node) => parentColors[node.data("layer")] || layerColors.other,
              "border-opacity": 0.8,
              "border-width": 2,
              "color": "#1e2933",
              "font-size": 30,
              "font-weight": 700,
              "label": "data(label)",
              "padding": 28,
              "shape": "round-rectangle",
              "text-background-opacity": 0,
              "text-halign": "center",
              "text-valign": "top",
            },
          },
          {
            selector: "node[kind = 'domain']",
            style: {
              "background-color": "#ffffff",
              "background-opacity": 0.52,
              "border-color": (node) => parentColors[node.data("layer")] || layerColors.other,
              "border-opacity": 0.38,
              "border-style": "dashed",
              "border-width": 1,
              "color": "#65758b",
              "font-size": 25,
              "font-weight": 700,
              "label": "data(label)",
              "padding": 18,
              "shape": "round-rectangle",
              "text-background-opacity": 0,
              "text-halign": "center",
              "text-valign": "top",
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              "line-color": "#a8b4c0",
              "opacity": 0.56,
              "target-arrow-color": "#a8b4c0",
              "target-arrow-shape": "triangle",
              "width": (edge) => Math.min(8, Math.max(1, edge.data("count") ? Math.log2(edge.data("count") + 1) : 1)),
            },
          },
          {
            selector: "edge[circular]",
            style: {
              "line-color": "#c0392b",
              "target-arrow-color": "#c0392b",
            },
          },
          {
            selector: ".faded",
            style: {
              "opacity": 0.08,
            },
          },
          {
            selector: ".selected",
            style: {
              "border-color": "#111827",
              "border-width": 3,
              "opacity": 1,
            },
          },
          {
            selector: ".group-hidden",
            style: {
              "display": "none",
            },
          },
        ],
        layout: {
          name: "cose",
          animate: false,
          idealEdgeLength: 90,
          nodeRepulsion: 500000,
          nodeOverlap: 16,
        },
      });

      function getFocusNodes(nodes) {
        const descendants = nodes.descendants("node");
        return nodes.union(descendants).filter((node) => !node.hasClass("group-hidden"));
      }

      function getDirectionalEdges(nodes) {
        const focusNodes = getFocusNodes(nodes);
        if (dependencyDirection === "inbound") {
          return focusNodes.incomers("edge");
        }
        if (dependencyDirection === "outbound") {
          return focusNodes.outgoers("edge");
        }
        return focusNodes.connectedEdges();
      }

      function getVisibleNeighborhood(nodes) {
        const focusNodes = getFocusNodes(nodes);
        const directionalEdges = getDirectionalEdges(nodes);
        const relatedNodes = directionalEdges.connectedNodes();
        const visibleNodes = nodes
          .union(focusNodes)
          .union(nodes.ancestors())
          .union(relatedNodes)
          .union(relatedNodes.ancestors())
          .filter((node) => !node.hasClass("group-hidden"));

        return visibleNodes.union(directionalEdges.filter((edge) => !edge.hasClass("group-hidden")));
      }

      function highlightNodes(nodes, options = {}) {
        cy.elements().removeClass("faded selected");

        if (nodes.length === 0) {
          return;
        }

        const visible = getVisibleNeighborhood(nodes);
        cy.elements().addClass("faded");
        nodes.addClass("selected");
        visible.removeClass("faded");

        if (options.fit) {
          cy.fit(visible.closedNeighborhood(), 48);
        }
      }

      function applySearch() {
        const term = document.getElementById("search").value.trim().toLowerCase();
        if (!term) {
          activeSelection = null;
          cy.elements().removeClass("faded selected");
          return;
        }

        const matches = cy.nodes().filter((node) => (
          !node.hasClass("group-hidden")
          && String(node.data("path")).toLowerCase().includes(term)
        ));
        activeSelection = matches;
        highlightNodes(matches, { fit: matches.length > 0 });
      }

      function setDependencyDirection(nextDirection) {
        dependencyDirection = nextDirection;
        document.querySelectorAll("[data-direction]").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.direction === dependencyDirection));
        });

        if (activeSelection) {
          highlightNodes(activeSelection, { fit: false });
        }
      }

      function setZoomSpeed(nextZoomSpeed) {
        zoomSpeed = Number(nextZoomSpeed);
        cy.renderer().wheelSensitivity = zoomSpeed;
        document.querySelectorAll("[data-zoom-speed]").forEach((button) => {
          button.setAttribute("aria-pressed", String(Number(button.dataset.zoomSpeed) === zoomSpeed));
        });
      }

      function getGroupNodes(groupId) {
        const groupNode = cy.getElementById(groupId);
        return groupNode.union(groupNode.descendants("node"));
      }

      function applyGroupVisibility() {
        cy.batch(() => {
          cy.elements().removeClass("group-hidden");

          for (const groupId of hiddenGroupIds) {
            getGroupNodes(groupId).addClass("group-hidden");
          }

          cy.edges().forEach((edge) => {
            if (edge.source().hasClass("group-hidden") || edge.target().hasClass("group-hidden")) {
              edge.addClass("group-hidden");
            }
          });
        });

        if (activeSelection) {
          activeSelection = activeSelection.filter((node) => !node.hasClass("group-hidden"));
          highlightNodes(activeSelection, { fit: false });
        }
      }

      function toggleGroup(groupId, button) {
        if (hiddenGroupIds.has(groupId)) {
          hiddenGroupIds.delete(groupId);
          button.setAttribute("aria-pressed", "false");
        } else {
          hiddenGroupIds.add(groupId);
          button.setAttribute("aria-pressed", "true");
        }

        applyGroupVisibility();
      }

      function buildGroupFilters() {
        const container = document.getElementById("groupFilters");
        const groupNodes = cy.nodes("[kind = 'top-layer'], [kind = 'domain']").sort((left, right) => {
          const leftPath = String(left.data("path"));
          const rightPath = String(right.data("path"));
          return leftPath.localeCompare(rightPath);
        });

        if (groupNodes.length === 0) {
          document.querySelector(".group-menu").hidden = true;
          return;
        }

        groupNodes.forEach((node) => {
          const button = document.createElement("button");
          const path = String(node.data("path"));
          button.type = "button";
          button.textContent = path;
          button.title = "Hide " + path;
          button.dataset.groupId = node.id();
          button.setAttribute("aria-pressed", "false");
          button.addEventListener("click", () => toggleGroup(node.id(), button));
          container.appendChild(button);
        });
      }

      buildGroupFilters();

      document.getElementById("fit").addEventListener("click", () => cy.fit(undefined, 32));
      document.querySelectorAll("[data-direction]").forEach((button) => {
        button.addEventListener("click", () => setDependencyDirection(button.dataset.direction));
      });
      document.querySelectorAll("[data-zoom-speed]").forEach((button) => {
        button.addEventListener("click", () => setZoomSpeed(button.dataset.zoomSpeed));
      });
      document.getElementById("search").addEventListener("input", () => {
        applySearch();
      });

      cy.on("tap", "node", (event) => {
        const node = event.target;
        activeSelection = node;
        highlightNodes(node, { fit: false });
      });

      cy.on("tap", (event) => {
        if (event.target === cy) {
          activeSelection = null;
          document.getElementById("search").value = "";
          cy.elements().removeClass("faded selected");
        }
      });
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
