import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth2 callback route for YouTube.
 * After the user grants permission, Google redirects here with ?code=xxx.
 * We pass the code back to the frontend which calls /api/social/youtube/connect (POST).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (error) {
    return NextResponse.redirect(`${appUrl}/social-accounts?youtube_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/social-accounts?youtube_error=no_code`);
  }

  // Redirect to frontend with the code — frontend will exchange it via POST
  return NextResponse.redirect(
    `${appUrl}/social-accounts?youtube_code=${encodeURIComponent(code)}`
  );
}
