import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log(" Updating all temple images...");

    const newImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Meenakshi_Temple.jpg/1200px-Meenakshi_Temple.jpg";

    const result = await prisma.temple.updateMany({
        data: {
            images: [newImageUrl],
        },
    });

    console.log(` Updated ${result.count} temples with new image URL`);
    console.log(` Image URL: ${newImageUrl}`);
}

main()
    .catch((e) => {
        console.error(" Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

