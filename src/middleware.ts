import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect mechanic routes
  if (pathname.startsWith("/mechanic") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    if (role === "MECHANIC") return NextResponse.redirect(new URL("/mechanic/dashboard", req.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
