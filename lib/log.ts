// One JSON line per event so Vercel Logs can filter on level / scope / msg.
// Never pass resume text, emails or tokens in `data`.
type Level = "info" | "warn" | "error";

export function errInfo(e: unknown): Record<string, unknown> {
  if (e instanceof Error) return { err: e.message.slice(0, 300), name: e.name, stack: e.stack?.split("\n").slice(1, 4).join(" | ") };
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    return { err: String(o.message ?? "").slice(0, 300), code: o.code, details: o.details, hint: o.hint };
  }
  return { err: String(e).slice(0, 300) };
}

export function log(level: Level, scope: string, msg: string, data?: Record<string, unknown>) {
  const line = JSON.stringify({ level, scope, msg, ...data });
  (level === "info" ? console.log : console[level])(line);
}

export const logError = (scope: string, e: unknown, data?: Record<string, unknown>) =>
  log("error", scope, "failed", { ...errInfo(e), ...data });

/** Wrap a route handler: one line per request with method, status and duration. */
export function logged<A extends unknown[]>(scope: string, fn: (...a: A) => Promise<Response>) {
  return async (...a: A): Promise<Response> => {
    const t0 = Date.now();
    try {
      const res = await fn(...a);
      log(res.status >= 500 ? "error" : res.status >= 400 ? "warn" : "info", scope, "done", { status: res.status, ms: Date.now() - t0 });
      return res;
    } catch (e) {
      logError(scope, e, { ms: Date.now() - t0 });
      throw e;
    }
  };
}
