"import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/reset-password";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");

  if (authError) {
    const destination = new URL("/forgot-password", requestUrl.origin);
    destination.searchParams.set("recovery_error", authError);
    return NextResponse.redirect(destination);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  const destination = new URL("/forgot-password", requestUrl.origin);
  destination.searchParams.set(
    "recovery_error",
    "The recovery link is invalid, expired, or has already been used. Please request a new one."
  );
  return NextResponse.redirect(destination);
}
