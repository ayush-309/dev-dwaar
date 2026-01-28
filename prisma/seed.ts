import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create a superuser
    const hashedPassword = await bcrypt.hash("admin123", 12);
    
    const superuser = await prisma.user.upsert({
        where: { email: "admin@templebook.com" },
        update: {},
        create: {
            email: "admin@templebook.com",
            password: hashedPassword,
            name: "System Admin",
            phone: "+91 9876543210",
            role: "SUPERUSER",
            isApproved: true,
        },
    });
    console.log("✅ Created superuser:", superuser.email);

    // Create a temple board member
    const templeBoardPassword = await bcrypt.hash("temple123", 12);
    
    const templeBoard = await prisma.user.upsert({
        where: { email: "board@templebook.com" },
        update: {},
        create: {
            email: "board@templebook.com",
            password: templeBoardPassword,
            name: "Temple Board Manager",
            phone: "+91 9876543211",
            role: "TEMPLE_BOARD",
            isApproved: true,
        },
    });
    console.log("✅ Created temple board user:", templeBoard.email);

    // Create a regular user
    const userPassword = await bcrypt.hash("user123", 12);
    
    const regularUser = await prisma.user.upsert({
        where: { email: "user@templebook.com" },
        update: {},
        create: {
            email: "user@templebook.com",
            password: userPassword,
            name: "Devotee User",
            phone: "+91 9876543212",
            role: "USER",
            isApproved: true,
        },
    });
    console.log("✅ Created regular user:", regularUser.email);

    // Sample temples data
    const templesData = [
        {
            name: "Shri Siddhivinayak Temple",
            description: "One of the most famous Ganesh temples in Mumbai. The temple is dedicated to Lord Ganesha and attracts thousands of devotees daily. The idol is believed to be 'Swayambhu' (self-manifested) and is said to fulfill the wishes of devotees.",
            location: "Prabhadevi, Mumbai",
            address: "SK Bole Marg, Prabhadevi",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400028",
            images: ["https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"],
            timings: "5:30 AM - 10:00 PM",
            dailyTicketLimit: 500,
            ticketPrice: 0,
        },
        {
            name: "Shri Kashi Vishwanath Temple",
            description: "One of the most famous Hindu temples dedicated to Lord Shiva. Located on the western bank of the holy river Ganga, it is one of the twelve Jyotirlingas. The temple has been a center of Hindu worship and culture for centuries.",
            location: "Varanasi, Uttar Pradesh",
            address: "Lahori Tola, Varanasi",
            city: "Varanasi",
            state: "Uttar Pradesh",
            pincode: "221001",
            images: ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800"],
            timings: "3:00 AM - 11:00 PM",
            dailyTicketLimit: 1000,
            ticketPrice: 50,
        },
        {
            name: "Tirumala Venkateswara Temple",
            description: "One of the richest and most visited temples in the world, dedicated to Lord Venkateswara. Located in the hill town of Tirumala at Tirupati. The temple is the most visited place of worship in the world.",
            location: "Tirumala, Andhra Pradesh",
            address: "Tirumala Hills, Tirupati",
            city: "Tirupati",
            state: "Andhra Pradesh",
            pincode: "517504",
            images: ["https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800"],
            timings: "2:30 AM - 1:30 AM (Next Day)",
            dailyTicketLimit: 5000,
            ticketPrice: 300,
        },
        {
            name: "Golden Temple (Harmandir Sahib)",
            description: "The holiest Gurdwara and the most important pilgrimage site of Sikhism. Known for its golden facade and spiritual atmosphere. The temple serves free meals (langar) to over 100,000 people daily.",
            location: "Amritsar, Punjab",
            address: "Golden Temple Road, Amritsar",
            city: "Amritsar",
            state: "Punjab",
            pincode: "143001",
            images: ["https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800"],
            timings: "Open 24 Hours",
            dailyTicketLimit: 2000,
            ticketPrice: 0,
        },
        {
            name: "Jagannath Temple",
            description: "A famous Hindu temple dedicated to Lord Jagannath, a form of Vishnu. One of the four sacred pilgrimage centers (Char Dham). Famous for the annual Rath Yatra festival.",
            location: "Puri, Odisha",
            address: "Grand Road, Puri",
            city: "Puri",
            state: "Odisha",
            pincode: "752001",
            images: ["https://images.unsplash.com/photo-1590137876181-2a5a7e340de2?w=800"],
            timings: "5:00 AM - 11:00 PM",
            dailyTicketLimit: 800,
            ticketPrice: 25,
        },
        {
            name: "Meenakshi Amman Temple",
            description: "A historic Hindu temple located on the southern bank of the Vaigai River. Dedicated to Goddess Meenakshi and Lord Sundareswarar. Known for its stunning Dravidian architecture and colorful gopurams.",
            location: "Madurai, Tamil Nadu",
            address: "Madurai Main Road",
            city: "Madurai",
            state: "Tamil Nadu",
            pincode: "625001",
            images: ["https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800"],
            timings: "5:00 AM - 12:30 PM, 4:00 PM - 10:00 PM",
            dailyTicketLimit: 600,
            ticketPrice: 20,
        },
    ];

    // Time slots template
    const timeSlots = [
        { startTime: "06:00", endTime: "08:00", capacity: 100 },
        { startTime: "08:00", endTime: "10:00", capacity: 100 },
        { startTime: "10:00", endTime: "12:00", capacity: 100 },
        { startTime: "14:00", endTime: "16:00", capacity: 100 },
        { startTime: "16:00", endTime: "18:00", capacity: 100 },
        { startTime: "18:00", endTime: "20:00", capacity: 100 },
    ];

    // Create temples with time slots
    for (const templeData of templesData) {
        const existingTemple = await prisma.temple.findFirst({
            where: { name: templeData.name },
        });

        if (existingTemple) {
            console.log(`⏭️  Temple already exists: ${templeData.name}`);
            continue;
        }

        const temple = await prisma.temple.create({
            data: {
                ...templeData,
                ownerId: templeBoard.id,
                timeSlots: {
                    create: timeSlots,
                },
            },
            include: {
                timeSlots: true,
            },
        });

        console.log(`🛕 Created temple: ${temple.name} with ${temple.timeSlots.length} time slots`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("   Superuser: admin@templebook.com / admin123");
    console.log("   Temple Board: board@templebook.com / temple123");
    console.log("   Regular User: user@templebook.com / user123");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
