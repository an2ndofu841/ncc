import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  function redirectWithCookies(pathname: string, searchParams?: Record<string, string>) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) =>
        url.searchParams.set(k, v)
      );
    }
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if (path.startsWith("/member") && !user) {
    return redirectWithCookies("/auth/login", { redirect: path });
  }

  if (
    path.startsWith("/member") &&
    user &&
    !path.startsWith("/member/payment")
  ) {
    const service = createServiceRoleClient();
    const { data: memberProfile } = await service
      .from("members")
      .select("payment_status, role")
      .eq("auth_id", user.id)
      .single();

    if (
      memberProfile &&
      memberProfile.payment_status !== "paid" &&
      !["system_admin", "office_staff", "editor"].includes(memberProfile.role)
    ) {
      return redirectWithCookies("/member/payment");
    }
  }

  if (path.startsWith("/admin")) {
    if (!user) {
      return redirectWithCookies("/auth/login", { redirect: path });
    }
    const service = createServiceRoleClient();
    const { data: profile } = await service
      .from("members")
      .select("role")
      .eq("auth_id", user.id)
      .single();

    if (
      !profile ||
      !["system_admin", "office_staff", "editor"].includes(profile.role)
    ) {
      return redirectWithCookies("/");
    }
  }

  if (path === "/auth/login" && user) {
    return redirectWithCookies("/member");
  }

  return supabaseResponse;
}
