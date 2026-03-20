export function catalogStackId(name: string, version: string): string {
  return `catalog:${name}:${version}`;
}

export function templateStackId(name: string, version: string): string {
  return `template:${name}:${version}`;
}

export function themeStackId(name: string, version: string): string {
  return `theme:${name}:${version}`;
}
