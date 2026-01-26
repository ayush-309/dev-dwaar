import QRCode from "qrcode";
import crypto from "crypto";
import { QRCodeData } from "@/types";

const SECRET_KEY = process.env.QR_SECRET_KEY || "default-secret-key-32-chars-long";
const ALGORITHM = "aes-256-gcm";

// Generate a signature for QR data verification
function generateSignature(data: Omit<QRCodeData, "signature">): string {
    const dataString = JSON.stringify({
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        templeId: data.templeId,
        visitDate: data.visitDate,
    });
    return crypto
        .createHmac("sha256", SECRET_KEY)
        .update(dataString)
        .digest("hex")
        .substring(0, 16);
}

// Encrypt QR data
function encryptData(data: string): string {
    const key = crypto.scryptSync(SECRET_KEY, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

// Decrypt QR data
export function decryptData(encryptedData: string): string {
    try {
        const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
        const key = crypto.scryptSync(SECRET_KEY, "salt", 32);
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch {
        throw new Error("Failed to decrypt QR code data");
    }
}

// Generate QR code data
export function generateQRCodeData(params: {
    bookingId: string;
    bookingNumber: string;
    userName: string;
    userPhone: string;
    templeName: string;
    templeId: string;
    visitDate: string;
    timeSlot: string;
    ticketCount: number;
}): { qrCodeData: string; signature: string } {
    const dataWithoutSignature: Omit<QRCodeData, "signature"> = {
        bookingId: params.bookingId,
        bookingNumber: params.bookingNumber,
        userName: params.userName,
        userPhone: params.userPhone,
        templeName: params.templeName,
        templeId: params.templeId,
        visitDate: params.visitDate,
        timeSlot: params.timeSlot,
        ticketCount: params.ticketCount,
    };

    const signature = generateSignature(dataWithoutSignature);
    const qrData: QRCodeData = { ...dataWithoutSignature, signature };
    const encrypted = encryptData(JSON.stringify(qrData));

    return { qrCodeData: encrypted, signature };
}

export async function generateQRCodeImage(data: string): Promise<string> {
    try {
        const qrCodeUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: "M",
            type: "image/png",
            width: 400,
            margin: 2,
            color: {
                dark: "#1e1b4b",
                light: "#ffffff",
            },
        });
        return qrCodeUrl;
    } catch {
        throw new Error("Failed to generate QR code image");
    }
}

// Combined function to generate both encrypted data and QR code image
export async function generateQRCode(params: {
    bookingNumber: string;
    userName: string;
    userPhone: string;
    templeName: string;
    visitDate: string;
    timeSlot: string;
    ticketCount: number;
    totalAmount: number;
}): Promise<{ qrCodeDataUrl: string; encryptedData: string }> {
    // Create QR data payload
    const qrPayload = {
        bookingNumber: params.bookingNumber,
        userName: params.userName,
        userPhone: params.userPhone,
        templeName: params.templeName,
        visitDate: params.visitDate,
        timeSlot: params.timeSlot,
        ticketCount: params.ticketCount,
        totalAmount: params.totalAmount,
        timestamp: new Date().toISOString(),
    };

    // Encrypt the data
    const encryptedData = encryptData(JSON.stringify(qrPayload));

    // Generate QR code image
    const qrCodeDataUrl = await generateQRCodeImage(encryptedData);

    return { qrCodeDataUrl, encryptedData };
}

// Verify QR code data - returns parsed data or null if invalid
export function verifyQRCode(encryptedData: string): any | null {
    try {
        const decrypted = decryptData(encryptedData);
        const data = JSON.parse(decrypted);
        return data;
    } catch (error) {
        console.error("QR verification failed:", error);
        return null;
    }
}

// Generate a unique booking number
export function generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `TBK-${timestamp}-${random}`;
}
