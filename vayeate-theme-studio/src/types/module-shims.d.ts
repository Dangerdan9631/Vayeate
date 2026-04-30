declare module 'tsyringe-react' {
  export function useResolve<T>(token: unknown): T;
}

declare module 'tsarch' {
  export function filesOfProject(tsConfigFilePath?: string): unknown;
}
