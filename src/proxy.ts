import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/sign-in", "/sign-up"];

export default auth((req) => {
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isAuthenticated = Boolean(req.auth);

  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
