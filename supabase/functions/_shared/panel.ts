import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
export const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
export function check<T extends { error: any }>(result: T) {
  if (result.error) throw Error("Account operation failed");
  return result as T & { error: null };
}
export async function identity(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) throw Error("Authentication required");
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at)
    throw Error("Verified account required");
  const token = auth.slice(7),
    claims = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
  if (!claims.session_id) throw Error("Session required");
  return {
    user: data.user,
    sessionId: String(claims.session_id),
    aal: String(claims.aal),
    client,
    db: admin(),
  };
}
export async function nativeGuard(ctx: Awaited<ReturnType<typeof identity>>) {
  const { data, error } = await ctx.db.auth.admin.mfa.listFactors({
    userId: ctx.user.id,
  });
  if (error) throw error;
  if (data.factors.some((f) => f.status === "verified") && ctx.aal !== "aal2")
    throw Error("Authenticator verification required");
}
export async function guard(req: Request) {
  const ctx = await identity(req);
  await nativeGuard(ctx);
  return ctx;
}
export const text = (value: unknown, max = 10000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
