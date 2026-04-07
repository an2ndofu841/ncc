import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@supabase/supabase-js";

async function isMaintenanceMode(): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();
    return data?.value === true;
  } catch {
    return false;
  }
}

const BYPASS_PREFIXES = ["/admin", "/auth", "/maintenance", "/_next", "/api"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const shouldBypass = BYPASS_PREFIXES.some((p) => path.startsWith(p));

  if (!shouldBypass) {
    const maintenance = await isMaintenanceMode();
    if (maintenance) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
