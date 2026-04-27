import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";

const BYPASS_COOKIE = "maintenance_bypass";
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getSettings(): Promise<{
  maintenance: boolean;
  previewKey: string | null;
}> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["maintenance_mode", "preview_key"]);

    let maintenance = false;
    let previewKey: string | null = null;
    for (const row of data ?? []) {
      if (row.key === "maintenance_mode") maintenance = row.value === true;
      if (row.key === "preview_key") previewKey = row.value as string;
    }
    return { maintenance, previewKey };
  } catch {
    return { maintenance: false, previewKey: null };
  }
}

const BYPASS_PREFIXES = ["/admin", "/auth", "/maintenance", "/_next", "/api"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const shouldBypass = BYPASS_PREFIXES.some((p) => path.startsWith(p));

  if (!shouldBypass) {
    const { maintenance, previewKey } = await getSettings();

    if (maintenance) {
      const incomingKey = request.nextUrl.searchParams.get("preview_key");
      if (incomingKey && previewKey && incomingKey === previewKey) {
        const url = request.nextUrl.clone();
        url.searchParams.delete("preview_key");
        const response = NextResponse.redirect(url);
        response.cookies.set(BYPASS_COOKIE, "1", {
          path: "/",
          maxAge: BYPASS_COOKIE_MAX_AGE,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        return response;
      }

      const hasBypass = request.cookies.get(BYPASS_COOKIE)?.value === "1";
      if (!hasBypass) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.rewrite(url);
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
