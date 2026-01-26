import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // If no token and not on login/register, redirect to login is handled by withAuth

        // Role-based protection
        if (path.startsWith("/admin") && token?.role !== "SUPERUSER") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        if (path.startsWith("/dashboard") && token?.role !== "TEMPLE_BOARD") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Approved temple board check
        if (
            path.startsWith("/dashboard") &&
            token?.role === "TEMPLE_BOARD" &&
            !token?.isApproved
        ) {
            return NextResponse.redirect(new URL("/pending-approval", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/bookings/:path*", "/my-bookings/:path*"],
};
