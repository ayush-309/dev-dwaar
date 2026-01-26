import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const { email, password, name, phone, role } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Default role is USER if not specified or invalid
        const userRole = Object.values(Role).includes(role) ? role : Role.USER;

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: userRole,
                isApproved: userRole === Role.USER, // Regular users don't need approval
            },
        });

        return NextResponse.json(
            { success: true, message: "User created successfully", data: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
