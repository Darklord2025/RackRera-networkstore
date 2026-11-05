// Minimal Deno globals for static validation with TypeScript; Supabase supplies the actual runtime.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};
