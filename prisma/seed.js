const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://laptop_admin:laptop_secure_password_2026@localhost:5432/laptop_ecommerce_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Standard registered customer",
    },
  });

  console.log("Roles seeded.");

  // 2. Create Permissions
  const permissionsData = [
    { name: "Manage Products", slug: "manage-products", description: "Create, update, delete products" },
    { name: "Manage Orders", slug: "manage-orders", description: "Update order status and handle refunds" },
    { name: "Manage Users", slug: "manage-users", description: "Manage user accounts and roles" },
    { name: "View Analytics", slug: "view-analytics", description: "Access admin dashboard reporting" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: {
        name: perm.name,
        slug: perm.slug,
        description: perm.description,
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });
  }
  console.log("Permissions seeded.");

  // 3. Create Users
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const userHashedPassword = await bcrypt.hash("User@123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@laptop.com" },
    update: {},
    create: {
      email: "admin@laptop.com",
      name: "System Administrator",
      password: hashedPassword,
      roleId: adminRole.id,
      status: "active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop",
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "user@laptop.com" },
    update: {},
    create: {
      email: "user@laptop.com",
      name: "Nguyễn Văn A",
      password: userHashedPassword,
      roleId: userRole.id,
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop",
    },
  });

  console.log("Users seeded.");

  // Create default address for customer
  const defaultAddress = await prisma.address.create({
    data: {
      userId: customerUser.id,
      recipientName: "Nguyễn Văn A",
      phone: "0987654321",
      streetAddress: "123 Đường Láng",
      ward: "Láng Hạ",
      district: "Đống Đa",
      city: "Hà Nội",
      isDefault: true,
    },
  });

  // 4. Create Brands
  const brandsData = [
    { name: "Apple", slug: "apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=128&h=128&fit=crop", description: "Premium laptops and devices designed by Apple in California." },
    { name: "Dell", slug: "dell", logo: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=128&h=128&fit=crop", description: "Reliable and high-performance business and consumer computers." },
    { name: "Asus", slug: "asus", logo: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=128&h=128&fit=crop", description: "Innovator in gaming hardware and lightweight laptops." },
    { name: "Lenovo", slug: "lenovo", logo: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=128&h=128&fit=crop", description: "World-class ThinkPads and flexible Yoga notebooks." },
    { name: "HP", slug: "hp", logo: "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?q=80&w=128&h=128&fit=crop", description: "Hewlett-Packard laptops catering to home, business, and gaming." },
  ];

  const brands = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log("Brands seeded.");

  // 5. Create Categories
  const categoriesData = [
    { name: "Gaming Laptops", slug: "gaming-laptops", description: "High refresh rates and powerful graphics cards for gaming enthusiasts.", image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=400&h=300&fit=crop" },
    { name: "Ultrabooks", slug: "ultrabooks", description: "Thin, light, and power-efficient laptops with premium build quality.", image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400&h=300&fit=crop" },
    { name: "Workstations", slug: "workstations", description: "Maximum processing power for CAD, video editing, and software development.", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=400&h=300&fit=crop" },
    { name: "Office Laptops", slug: "office-laptops", description: "Affordable and durable laptops suited for daily productivity tasks.", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400&h=300&fit=crop" },
  ];

  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("Categories seeded.");

  // 6. Create Shipping Methods
  const standardShipping = await prisma.shippingMethod.upsert({
    where: { name: "Standard Delivery" },
    update: {},
    create: {
      name: "Standard Delivery",
      description: "Standard delivery to your address",
      price: 30000,
      estimatedDays: "3-5 days",
    },
  });

  const expressShipping = await prisma.shippingMethod.upsert({
    where: { name: "Express Delivery" },
    update: {},
    create: {
      name: "Express Delivery",
      description: "Same day or next day delivery",
      price: 50000,
      estimatedDays: "1-2 days",
    },
  });
  console.log("Shipping methods seeded.");

  // 7. Create Products
  const productsData = [
    {
      name: "Asus ROG Strix G16 (2024)",
      slug: "asus-rog-strix-g16-2024",
      SKU: "ROG-G16-4060",
      description: "The Asus ROG Strix G16 features a spectacular 16-inch screen, Intel Core i7-13650HX, 16GB of DDR5 RAM, and a powerful NVIDIA GeForce RTX 4060. Perfect for competitive gaming and high-intensity creative work.",
      price: 34990000,
      discountPrice: 31990000,
      brandId: brands["asus"].id,
      categoryId: categories["gaming-laptops"].id,
      cpu: "Intel Core i7-13650HX",
      ram: "16GB DDR5 4800MHz",
      ssd: "512GB PCIe 4.0 NVMe",
      gpu: "NVIDIA GeForce RTX 4060 8GB GDDR6",
      screen: "16 inch WQXGA (2560 x 1600) 165Hz IPS",
      os: "Windows 11 Home",
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=800&fit=crop",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&fit=crop",
      ],
    },
    {
      name: "MacBook Pro 14-inch M3",
      slug: "macbook-pro-14-inch-m3",
      SKU: "MBP-14-M3",
      description: "Apple MacBook Pro 14 featuring the Apple M3 chip. Built with an extraordinary Liquid Retina XDR screen, 8GB RAM, and 512GB SSD. Delivers remarkable battery life up to 22 hours and phenomenal performance for developers and designers.",
      price: 39990000,
      discountPrice: 37490000,
      brandId: brands["apple"].id,
      categoryId: categories["ultrabooks"].id,
      cpu: "Apple M3 8-core",
      ram: "8GB Unified Memory",
      ssd: "512GB Superfast SSD",
      gpu: "10-core GPU with hardware-accelerated ray tracing",
      screen: "14.2 inch Liquid Retina XDR (3024 x 1964) 120Hz ProMotion",
      os: "macOS Sonoma",
      isFeatured: true,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&fit=crop",
      ],
    },
    {
      name: "Dell XPS 15 9530",
      slug: "dell-xps-15-9530",
      SKU: "DELL-XPS-9530",
      description: "The ultimate laptop for creators. Boasting an Intel Core i7-13700H, 16GB of DDR5 RAM, 1TB NVMe SSD, and NVIDIA RTX 4050. Surrounded by an astonishingly narrow-bezel InfinityEdge 15.6 inch OLED display.",
      price: 54990000,
      discountPrice: null,
      brandId: brands["dell"].id,
      categoryId: categories["workstations"].id,
      cpu: "Intel Core i7-13700H",
      ram: "16GB DDR5 4800MHz",
      ssd: "1TB PCIe 4.0 NVMe",
      gpu: "NVIDIA GeForce RTX 4050 6GB GDDR6",
      screen: "15.6 inch OLED 3.5K (3456 x 2160) InfinityEdge Touch",
      os: "Windows 11 Pro",
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&fit=crop",
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=800&fit=crop",
      ],
    },
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      slug: "lenovo-thinkpad-x1-carbon-gen-11",
      SKU: "TP-X1-GEN11",
      description: "Engineered for executive mobility. Super lightweight chassis crafted with carbon fiber. Powered by Intel Core i7-1355U, 16GB RAM, and 512GB SSD. Exceptional security features and legendary keyboard typing experience.",
      price: 45990000,
      discountPrice: 43990000,
      brandId: brands["lenovo"].id,
      categoryId: categories["office-laptops"].id,
      cpu: "Intel Core i7-1355U",
      ram: "16GB LPDDR5 6400MHz",
      ssd: "512GB PCIe 4.0 NVMe",
      gpu: "Intel Iris Xe Graphics",
      screen: "14.0 inch WUXGA (1920 x 1200) IPS Anti-glare",
      os: "Windows 11 Pro",
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&fit=crop",
      ],
    },
    {
      name: "HP Victus 16 (Ryzen 7)",
      slug: "hp-victus-16-ryzen-7",
      SKU: "HP-V16-7840HS",
      description: "Excellent price-to-performance ratio. Equipped with AMD Ryzen 7 7840HS, NVIDIA RTX 4050 graphics, 16GB RAM, and 512GB SSD. Delivers solid thermal performance for gaming sessions and study workloads.",
      price: 24990000,
      discountPrice: 21990000,
      brandId: brands["hp"].id,
      categoryId: categories["gaming-laptops"].id,
      cpu: "AMD Ryzen 7 7840HS",
      ram: "16GB DDR5 5600MHz",
      ssd: "512GB PCIe 4.0 NVMe",
      gpu: "NVIDIA GeForce RTX 4050 6GB GDDR6",
      screen: "16.1 inch FHD (1920 x 1080) 144Hz IPS",
      os: "Windows 11 Home",
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?q=80&w=800&fit=crop",
      ],
    },
  ];

  for (const prod of productsData) {
    const dbProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        SKU: prod.SKU,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        brandId: prod.brandId,
        categoryId: prod.categoryId,
        cpu: prod.cpu,
        ram: prod.ram,
        ssd: prod.ssd,
        gpu: prod.gpu,
        screen: prod.screen,
        os: prod.os,
        isFeatured: prod.isFeatured,
        isNew: prod.isNew,
        isBestSeller: prod.isBestSeller,
        averageRating: 4.8,
        inventory: {
          create: {
            quantity: 25,
            lowStockThreshold: 5,
          },
        },
      },
    });

    // Create product images
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          url: prod.images[i],
          isPrimary: i === 0,
        },
      });
    }

    // Create a review for each laptop
    await prisma.review.create({
      data: {
        productId: dbProduct.id,
        userId: customerUser.id,
        rating: 5,
        title: "Tuyệt vời",
        comment: "Sản phẩm dùng rất mượt mà, màn hình đẹp, đóng gói cẩn thận và giao hàng siêu nhanh!",
      },
    });
  }

  console.log("Products and reviews seeded.");

  // 8. Create Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Mùa tựu trường - Laptop giảm đến 20%",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&fit=crop",
        linkUrl: "/products?category=gaming-laptops",
        position: "hero",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "MacBook Air M3 Mới Cực Mượt",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&fit=crop",
        linkUrl: "/products?brand=apple",
        position: "hero",
        isActive: true,
        sortOrder: 2,
      },
    ],
  });
  console.log("Banners seeded.");

  // 9. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "LAPTOPNEW10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 20000000,
        maxDiscount: 2000000,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        limitCount: 100,
        isActive: true,
      },
      {
        code: "DELLVIP500",
        discountType: "fixed_amount",
        discountValue: 500000,
        minOrderValue: 30000000,
        maxDiscount: 500000,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        limitCount: 50,
        isActive: true,
      },
    ],
  });
  console.log("Coupons seeded.");

  // 10. Create News
  await prisma.news.create({
    data: {
      title: "Xu hướng chọn Laptop Gaming năm 2026",
      slug: "xu-huong-chon-laptop-gaming-nam-2026",
      summary: "Tổng hợp các mẫu laptop gaming đáng mua nhất năm 2026 với cấu hình vượt trội RTX 40 Series và CPU Intel Core Ultra thế hệ mới.",
      content: "<p>Năm 2026 chứng kiến sự bùng nổ của các dòng Laptop Gaming được trang bị bộ xử lý AI tích hợp và card đồ họa thế hệ mới. Không chỉ dừng lại ở hiệu năng thuần túy, các dòng laptop gaming ngày nay còn hướng tới sự mỏng nhẹ và thời lượng pin tối ưu hơn nhờ vào kiến trúc chip mới. Bài viết này sẽ phân tích các yếu tố quyết định lựa chọn laptop gaming hiện tại như tần số quét màn hình 240Hz, dung lượng RAM DDR5 tối thiểu 16GB và hệ thống tản nhiệt buồng hơi tiên tiến.</p>",
      coverImage: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=600&fit=crop",
      authorId: adminUser.id,
      status: "published",
    },
  });
  console.log("News seeded.");

  // 11. Create a simulated Order for analytical dashboard representation
  const asusG16 = await prisma.product.findFirst({ where: { slug: "asus-rog-strix-g16-2024" } });
  if (asusG16) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: "ORD-20260704-001",
        userId: customerUser.id,
        addressId: defaultAddress.id,
        shippingMethodId: standardShipping.id,
        totalAmount: asusG16.price,
        discountAmount: 2000000, // laptop new 10 coupon
        shippingFee: standardShipping.price,
        finalAmount: asusG16.price - 2000000 + standardShipping.price,
        status: "completed",
        paymentStatus: "paid",
        notes: "Giao hàng giờ hành chính giúp tôi.",
        items: {
          create: {
            productId: asusG16.id,
            price: asusG16.price,
            quantity: 1,
          },
        },
      },
    });

    await prisma.payment.create({
      data: {
        orderId: sampleOrder.id,
        paymentMethod: "bank_transfer",
        transactionId: "TXN123456789",
        amount: sampleOrder.finalAmount,
        status: "success",
        rawResponse: '{"status":"00","message":"Success"}',
      },
    });
  }
  console.log("Analytics sample order seeded.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
