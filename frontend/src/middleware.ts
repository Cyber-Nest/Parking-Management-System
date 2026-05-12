import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.get("auth")?.value;

  const isAdminRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isAdminRoute && !isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value;

//   const isAdminRoute = request.nextUrl.pathname.startsWith("/dashboard");

//   if (isAdminRoute && !token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
