import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserWithOrgMembers } from "./app/api/auth/types";

const USER_TOKEN = "er-user-token";
const USER = "er-user";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(USER_TOKEN);
  const sessionUser = request.cookies.get(USER);
  let user: UserWithOrgMembers | null = null;

  try {
    user = JSON.parse(sessionUser?.value || "null");
  } catch {
    user = null;
  }

  const onlyPublicRoutes = ["/login", "/register"];
  const isOnlyPublic = onlyPublicRoutes.includes(request.nextUrl.pathname);

  if (!session && !isOnlyPublic) {
    const url = new URL("/login", request.url);
    if (!url.searchParams.has("redirect_to")) {
      url.searchParams.set("redirect_to", request.nextUrl.pathname);
    }
    return NextResponse.redirect(url);
  }

  if (session && isOnlyPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && !isOnlyPublic) {
    const path = request.nextUrl.pathname;

    if (
      path.includes("owner-dashboard") &&
      !user?.OrganizationMembers.some((org) => org.role === "OWNER")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      path.includes("employee-dashboard") &&
      !user?.OrganizationMembers.some((org) => org.role === "EMPLOYEE")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      path.includes("supervisor-dashboard") &&
      !user?.OrganizationMembers.some((org) => org.role === "SUPERVISOR")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login/:paths*",
    "/register/:paths*",
    "/protected/:paths*",
    "/owner-dashboard/:paths*",
    "/employee-dashboard/:paths*",
    "/supervisor-dashboard/:paths*",
  ],
};
