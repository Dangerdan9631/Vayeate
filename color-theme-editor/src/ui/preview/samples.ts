import exampleTs from "../../../../examples/example.ts?raw";
import exampleJson from "../../../../examples/example.json?raw";
import exampleMd from "../../../../examples/example.md?raw";
import examplePs1 from "../../../../examples/example.ps1?raw";
import exampleRust from "../../../../examples/lib.rs?raw";

export interface PreviewSampleContent {
  id: string;
  label: string;
  language: "ts" | "json" | "md" | "ps1" | "rust";
  relativePath: string;
  content: string;
}

export const previewSamples: PreviewSampleContent[] = [
  { id: "ts", label: "TypeScript", language: "ts", relativePath: "examples/example.ts", content: exampleTs },
  { id: "json", label: "JSON", language: "json", relativePath: "examples/example.json", content: exampleJson },
  { id: "md", label: "Markdown", language: "md", relativePath: "examples/example.md", content: exampleMd },
  { id: "ps1", label: "PowerShell", language: "ps1", relativePath: "examples/example.ps1", content: examplePs1 },
  { id: "rust", label: "Rust", language: "rust", relativePath: "examples/lib.rs", content: exampleRust },
];