import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function bi(vi, en) {
  return { vi, en };
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const suvTemplateItems = [
  { key: "range", unit: "km", defaultValue: 450, showInStrip: true, sortOrder: 1, groupKey: "performance" },
  { key: "power", unit: "kW", defaultValue: 150, showInStrip: true, sortOrder: 2, groupKey: "performance" },
  { key: "battery", unit: "kWh", defaultValue: 75, showInStrip: false, sortOrder: 3, groupKey: "performance" },
  { key: "seats", unit: "seats", defaultValue: 5, showInStrip: true, sortOrder: 4, groupKey: "dimensions" },
];

const mpvTemplateItems = [
  { key: "range", unit: "km", defaultValue: 380, showInStrip: true, sortOrder: 1, groupKey: "performance" },
  { key: "power", unit: "kW", defaultValue: 120, showInStrip: true, sortOrder: 2, groupKey: "performance" },
  { key: "seats", unit: "seats", defaultValue: 7, showInStrip: true, sortOrder: 3, groupKey: "dimensions" },
];

const vanTemplateItems = [
  { key: "range", unit: "km", defaultValue: 280, showInStrip: true, sortOrder: 1, groupKey: "performance" },
  { key: "payload", unit: "kg", defaultValue: 900, showInStrip: true, sortOrder: 2, groupKey: "cargo" },
  { key: "seats", unit: "seats", defaultValue: 2, showInStrip: false, sortOrder: 3, groupKey: "dimensions" },
];

async function main() {
  console.log("Seeding car-retail…");

  // Units
  const units = [
    { key: "km", value: bi("km", "km") },
    { key: "kW", value: bi("kW", "kW") },
    { key: "kWh", value: bi("kWh", "kWh") },
    { key: "seats", value: bi("chỗ", "seats") },
    { key: "kg", value: bi("kg", "kg") },
  ];
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { key: unit.key },
      update: { value: unit.value },
      create: unit,
    });
  }

  // Attribute keys (labels live in messages/*.json spec.*)
  const attributeKeys = [
    { key: "range", groupKey: "performance", sortOrder: 1 },
    { key: "power", groupKey: "performance", sortOrder: 2 },
    { key: "battery", groupKey: "performance", sortOrder: 3 },
    { key: "seats", groupKey: "dimensions", sortOrder: 4 },
    { key: "payload", groupKey: "cargo", sortOrder: 5 },
  ];
  for (const ak of attributeKeys) {
    await prisma.attributeKey.upsert({
      where: { key: ak.key },
      update: { groupKey: ak.groupKey, sortOrder: ak.sortOrder },
      create: ak,
    });
  }

  // Attribute templates
  const templates = [
    {
      key: "electric-suv-standard",
      name: bi("SUV điện tiêu chuẩn", "Standard electric SUV"),
      items: suvTemplateItems,
    },
    {
      key: "electric-mpv-standard",
      name: bi("MPV điện tiêu chuẩn", "Standard electric MPV"),
      items: mpvTemplateItems,
    },
    {
      key: "commercial-van",
      name: bi("Xe tải thương mại", "Commercial van"),
      items: vanTemplateItems,
    },
  ];
  for (const tpl of templates) {
    await prisma.attributeTemplate.upsert({
      where: { key: tpl.key },
      update: { name: tpl.name, items: tpl.items },
      create: tpl,
    });
  }

  const siteSettingsData = {
    dealerName: bi("Đại lý Ô tô Mẫu", "Sample Auto Dealer"),
    legalEntity: bi("CÔNG TY TNHH Ô TÔ MẪU", "SAMPLE AUTO CO., LTD"),
    mst: "0000000000",
    email: "info@example-dealer.com",
    copyright: bi("© 2026 Đại lý Ô tô Mẫu", "© 2026 Sample Auto Dealer"),
    disclaimers: bi(
      "Trang thông tin & phân phối sản phẩm ô tô điện.",
      "Vehicle distribution & product marketing site."
    ),
    brandStory: {
      vi: {
        title: "Về đại lý",
        body: "Chúng tôi là đại lý phân phối xe điện, cung cấp tư vấn, lái thử và hỗ trợ sau bán hàng tại showroom.",
      },
      en: {
        title: "About our dealership",
        body: "We are an authorized electric vehicle dealer offering test drives, sales consulting, and after-sales support.",
      },
    },
    socialLinks: [
      { platform: "facebook", url: "https://facebook.com/" },
      { platform: "zalo", url: "https://zalo.me/1900123456" },
    ],
    seoDefaults: {
      vi: { title: "Đại lý Ô tô Mẫu", description: "Khám phá xe điện và xe xăng mới." },
      en: { title: "Sample Auto Dealer", description: "Explore new electric and gasoline vehicles." },
    },
    ctaTestDrive: { label: bi("Đăng ký lái thử", "Book test drive"), routeKey: "/book-test-drive" },
    ctaDeposit: { label: bi("Đặt cọc", "Deposit"), routeKey: "/deposit" },
    consentTemplate: bi(
      "Tôi đồng ý với chính sách bảo mật và cho phép liên hệ tư vấn.",
      "I agree to the privacy policy and consent to be contacted."
    ),
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: siteSettingsData,
    create: { id: "singleton", ...siteSettingsData },
  });

  // Showrooms — 3-branch network (Thủ Đức, Quận 7, Bình Dương)
  const showroom1Data = {
    id: "seed-showroom-1",
    name: bi("Volta Auto Thủ Đức", "Volta Auto Thu Duc"),
    address: bi(
      "123 Võ Nguyên Giáp, Thủ Đức, TP. Hồ Chí Minh",
      "123 Vo Nguyen Giap, Thu Duc, Ho Chi Minh City",
    ),
    city: "Ho Chi Minh City",
    phone: "1900123456",
    hours: bi("T2–CN: 8:00–20:00", "Mon–Sun: 8:00 AM–8:00 PM"),
    typeTag: "3S",
    sortOrder: 1,
    published: true,
  };
  const { id: showroom1Id, ...showroom1Fields } = showroom1Data;
  const showroom = await prisma.showroom.upsert({
    where: { id: showroom1Id },
    update: showroom1Fields,
    create: showroom1Data,
  });

  await prisma.hotline.upsert({
    where: { id: "seed-hotline-1" },
    update: {},
    create: {
      id: "seed-hotline-1",
      label: bi("Tư vấn bán hàng", "Sales hotline"),
      phone: "1900123456",
      sortOrder: 1,
      showroomId: showroom.id,
    },
  });

  await prisma.hotline.upsert({
    where: { id: "seed-hotline-2" },
    update: {},
    create: {
      id: "seed-hotline-2",
      label: bi("Hỗ trợ kỹ thuật", "Technical support"),
      phone: "1900654321",
      sortOrder: 2,
    },
  });

  const showroom2Data = {
    id: "seed-showroom-2",
    name: bi("Volta Auto Quận 7", "Volta Auto District 7"),
    address: bi(
      "456 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
      "456 Nguyen Van Linh, District 7, Ho Chi Minh City",
    ),
    city: "Ho Chi Minh City",
    phone: "1900654321",
    hours: bi("T2–CN: 8:30–19:00", "Mon–Sun: 8:30 AM–7:00 PM"),
    typeTag: "3S",
    sortOrder: 2,
    published: true,
  };
  const { id: showroom2Id, ...showroom2Fields } = showroom2Data;
  await prisma.showroom.upsert({
    where: { id: showroom2Id },
    update: showroom2Fields,
    create: showroom2Data,
  });

  const showroom3Data = {
    id: "seed-showroom-3",
    name: bi("Volta Auto Bình Dương", "Volta Auto Binh Duong"),
    address: bi(
      "789 Đại lộ Bình Dương, Thủ Dầu Một, Bình Dương",
      "789 Binh Duong Boulevard, Thu Dau Mot, Binh Duong",
    ),
    city: "Binh Duong",
    phone: "1900789012",
    hours: bi("T2–CN: 8:00–19:00", "Mon–Sun: 8:00 AM–7:00 PM"),
    typeTag: "2S",
    sortOrder: 3,
    published: true,
  };
  const { id: showroom3Id, ...showroom3Fields } = showroom3Data;
  await prisma.showroom.upsert({
    where: { id: showroom3Id },
    update: showroom3Fields,
    create: showroom3Data,
  });

  // Menu items — 7-item primary header + footer quick links (incl. Showrooms)
  const menuItems = [
    { id: "seed-menu-home", label: bi("Trang chủ", "Home"), routeKey: "/", placement: "HEADER", sortOrder: 1 },
    { id: "seed-menu-products", label: bi("Sản phẩm", "Products"), routeKey: "/models", placement: "HEADER", sortOrder: 2 },
    { id: "seed-menu-promotions", label: bi("Khuyến mãi", "Promotions"), routeKey: "/news", placement: "HEADER", sortOrder: 3 },
    { id: "seed-menu-test-drive", label: bi("Lái thử", "Test Drive"), routeKey: "/book-test-drive", placement: "HEADER", sortOrder: 4 },
    { id: "seed-menu-showroom", label: bi("Showroom", "Showroom"), routeKey: "/showrooms", placement: "HEADER", sortOrder: 5 },
    { id: "seed-menu-news", label: bi("Tin tức", "News"), routeKey: "/news", placement: "HEADER", sortOrder: 6 },
    { id: "seed-menu-contact-header", label: bi("Liên hệ", "Contact"), routeKey: "/contact", placement: "HEADER", sortOrder: 7 },
    { id: "seed-menu-about", label: bi("Về chúng tôi", "About"), routeKey: "/about", placement: "HEADER", sortOrder: 99, visible: false },
    { id: "seed-menu-footer-about", label: bi("Giới thiệu", "About Us"), routeKey: "/about", placement: "FOOTER", sortOrder: 1 },
    { id: "seed-menu-footer-test-drive", label: bi("Đăng ký lái thử", "Book Test Drive"), routeKey: "/book-test-drive", placement: "FOOTER", sortOrder: 2 },
    { id: "seed-menu-footer-deposit", label: bi("Báo giá & Đặt cọc", "Quote & Deposit"), routeKey: "/deposit", placement: "FOOTER", sortOrder: 3 },
    { id: "seed-menu-footer-showrooms", label: bi("Showroom", "Showrooms"), routeKey: "/showrooms", placement: "FOOTER", sortOrder: 4 },
    { id: "seed-menu-footer-news", label: bi("Tin tức khuyến mãi", "News & Campaigns"), routeKey: "/news", placement: "FOOTER", sortOrder: 5 },
    { id: "seed-menu-footer-policies", label: bi("Chính sách đại lý", "Policies"), routeKey: "/policies", placement: "FOOTER", sortOrder: 6 },
    { id: "seed-menu-contact", label: bi("Liên hệ", "Contact"), routeKey: "/contact", placement: "FOOTER", sortOrder: 7 },
  ];
  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  // Vehicle catalog
  const personalLine = await prisma.vehicleLine.upsert({
    where: { key: "personal" },
    update: {},
    create: { key: "personal", name: bi("Xe cá nhân", "Personal vehicles"), sortOrder: 1 },
  });

  const commercialLine = await prisma.vehicleLine.upsert({
    where: { key: "commercial" },
    update: {},
    create: { key: "commercial", name: bi("Xe thương mại", "Commercial vehicles"), sortOrder: 2 },
  });

  const suvSegment = await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: personalLine.id, key: "suv" } },
    update: {},
    create: { lineId: personalLine.id, key: "suv", name: bi("SUV", "SUV"), sortOrder: 1 },
  });

  const mpvSegment = await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: personalLine.id, key: "mpv" } },
    update: {},
    create: { lineId: personalLine.id, key: "mpv", name: bi("MPV", "MPV"), sortOrder: 2 },
  });

  const vanSegment = await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: commercialLine.id, key: "van" } },
    update: {},
    create: { lineId: commercialLine.id, key: "van", name: bi("Van", "Van"), sortOrder: 1 },
  });

  const cityEv = await prisma.vehicleModel.upsert({
    where: { id: "seed-model-city-ev" },
    update: {},
    create: {
      id: "seed-model-city-ev",
      segmentId: suvSegment.id,
      name: bi("City EV Compact", "City EV Compact"),
      slug: bi("city-ev-compact", "city-ev-compact"),
      tagline: bi("Linh hoạt cho đô thị", "Agile urban mobility"),
      description: bi(
        "Xe điện cỡ nhỏ, phù hợp di chuyển nội đô hàng ngày.",
        "Compact electric vehicle for daily urban commuting."
      ),
      attributes: [
        { key: "range", value: 320, unit: "km" },
        { key: "power", value: 100, unit: "kW" },
        { key: "seats", value: 5, unit: "seats" },
      ],
      published: true,
      sortOrder: 1,
    },
  });

  const familySuv = await prisma.vehicleModel.upsert({
    where: { id: "seed-model-family-suv" },
    update: {},
    create: {
      id: "seed-model-family-suv",
      segmentId: suvSegment.id,
      name: bi("Family SUV Electric", "Family SUV Electric"),
      slug: bi("family-suv-electric", "family-suv-electric"),
      tagline: bi("Không gian rộng rãi", "Spacious family comfort"),
      description: bi(
        "SUV điện 5+2 chỗ với quãng đường dài và an toàn cao.",
        "5+2 electric SUV with long range and advanced safety."
      ),
      attributes: [
        { key: "range", value: 480, unit: "km" },
        { key: "power", value: 160, unit: "kW" },
        { key: "battery", value: 82, unit: "kWh" },
        { key: "seats", value: 7, unit: "seats" },
      ],
      published: true,
      sortOrder: 2,
    },
  });

  const urbanMpv = await prisma.vehicleModel.upsert({
    where: { id: "seed-model-urban-mpv" },
    update: {},
    create: {
      id: "seed-model-urban-mpv",
      segmentId: mpvSegment.id,
      name: bi("Urban MPV Plus", "Urban MPV Plus"),
      slug: bi("urban-mpv-plus", "urban-mpv-plus"),
      tagline: bi("Đa dụng cho gia đình", "Versatile family MPV"),
      attributes: [
        { key: "range", value: 400, unit: "km" },
        { key: "seats", value: 7, unit: "seats" },
      ],
      published: true,
      sortOrder: 1,
    },
  });

  const cargoVan = await prisma.vehicleModel.upsert({
    where: { id: "seed-model-cargo-van" },
    update: {},
    create: {
      id: "seed-model-cargo-van",
      segmentId: vanSegment.id,
      name: bi("Cargo Van E", "Cargo Van E"),
      slug: bi("cargo-van-e", "cargo-van-e"),
      tagline: bi("Vận tải đô thị", "Urban cargo delivery"),
      attributes: [
        { key: "range", value: 260, unit: "km" },
        { key: "payload", value: 850, unit: "kg" },
      ],
      published: true,
      sortOrder: 1,
    },
  });

  // Variants
  await prisma.vehicleVariant.upsert({
    where: { id: "seed-variant-city-standard" },
    update: {},
    create: {
      id: "seed-variant-city-standard",
      modelId: cityEv.id,
      name: bi("Bản Tiêu chuẩn", "Standard"),
      price: 599000000,
      attributes: [{ key: "range", value: 320, unit: "km" }],
      published: true,
      sortOrder: 1,
    },
  });

  await prisma.vehicleVariant.upsert({
    where: { id: "seed-variant-family-plus" },
    update: {},
    create: {
      id: "seed-variant-family-plus",
      modelId: familySuv.id,
      name: bi("Bản Plus", "Plus"),
      price: 899000000,
      attributes: [{ key: "range", value: 480, unit: "km" }],
      published: true,
      sortOrder: 1,
    },
  });

  await prisma.vehicleVariant.upsert({
    where: { id: "seed-variant-mpv-base" },
    update: {},
    create: {
      id: "seed-variant-mpv-base",
      modelId: urbanMpv.id,
      name: bi("Bản Cơ bản", "Base"),
      price: 749000000,
      published: true,
      sortOrder: 1,
    },
  });

  await prisma.vehicleVariant.upsert({
    where: { id: "seed-variant-van-base" },
    update: {},
    create: {
      id: "seed-variant-van-base",
      modelId: cargoVan.id,
      name: bi("Bản Tải", "Cargo"),
      price: 529000000,
      published: true,
      sortOrder: 1,
    },
  });

  // Model FAQs & feature sections
  await prisma.modelFaq.upsert({
    where: { id: "seed-faq-family-1" },
    update: {},
    create: {
      id: "seed-faq-family-1",
      modelId: familySuv.id,
      question: bi("Thời gian sạc đầy?", "Full charge time?"),
      answer: bi("Khoảng 8 giờ (AC) hoặc 35 phút (DC 80%).", "About 8 hours (AC) or 35 minutes (DC to 80%)."),
      sortOrder: 1,
    },
  });

  await prisma.featureSection.upsert({
    where: { id: "seed-feature-family-1" },
    update: {},
    create: {
      id: "seed-feature-family-1",
      modelId: familySuv.id,
      title: bi("An toàn thông minh", "Smart safety"),
      body: bi(
        "Hệ thống hỗ trợ lái ADAS cấp L2 và 8 túi khí.",
        "L2 ADAS driver assistance and 8 airbags."
      ),
      sortOrder: 1,
    },
  });

  // Homepage CMS
  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-1" },
    update: {},
    create: {
      id: "seed-hero-1",
      title: bi("Khám phá xe điện mới", "Discover new electric vehicles"),
      subtitle: bi("Lái thử miễn phí tại showroom", "Free test drive at our showroom"),
      ctaLabel: bi("Đăng ký lái thử", "Book test drive"),
      ctaRouteKey: "/book-test-drive",
      sortOrder: 1,
    },
  });

  const serviceBlocks = [
    {
      id: "seed-service-test-drive",
      title: bi("Lái thử", "Test drive"),
      description: bi("Trải nghiệm xe tại showroom.", "Experience vehicles at our showroom."),
      iconKey: "steering-wheel",
      linkRouteKey: "/book-test-drive",
      sortOrder: 1,
    },
    {
      id: "seed-service-trade-in",
      title: bi("Thu cũ đổi mới", "Trade-in"),
      description: bi("Định giá nhanh, hỗ trợ thủ tục.", "Fast appraisal and paperwork support."),
      iconKey: "refresh",
      sortOrder: 2,
    },
  ];
  for (const block of serviceBlocks) {
    await prisma.serviceBlock.upsert({ where: { id: block.id }, update: block, create: block });
  }

  // Static pages
  const pages = [
    {
      pageType: "about",
      slug: bi("ve-chung-toi", "about"),
      title: bi("Về chúng tôi", "About us"),
      body: bi(
        "Chúng tôi là đại lý ô tô chuyên cung cấp xe điện và xe xăng.",
        "We are a dealership specializing in electric and gasoline vehicles."
      ),
    },
    {
      pageType: "contact",
      slug: bi("lien-he", "contact"),
      title: bi("Liên hệ", "Contact"),
      body: bi("Hotline: 1900123456 — Email: info@example-dealer.com", "Hotline: 1900123456 — Email: info@example-dealer.com"),
    },
  ];
  for (const page of pages) {
    await prisma.page.upsert({
      where: { pageType: page.pageType },
      update: page,
      create: page,
    });
  }

  // FAQ
  await prisma.faqItem.upsert({
    where: { id: "seed-faq-global-1" },
    update: {},
    create: {
      id: "seed-faq-global-1",
      question: bi("Làm sao đăng ký lái thử?", "How do I book a test drive?"),
      answer: bi("Điền form Đăng ký lái thử trên website.", "Fill in the test drive form on this website."),
      sortOrder: 1,
    },
  });

  // News
  await prisma.newsPost.upsert({
    where: { id: "seed-news-1" },
    update: {},
    create: {
      id: "seed-news-1",
      slug: bi("ra-mat-xe-dien-moi", "new-electric-lineup"),
      title: bi("Ra mắt dòng xe điện mới", "New electric lineup launch"),
      excerpt: bi("Khám phá các mẫu xe điện mới tại showroom.", "Explore new electric models at our showroom."),
      body: bi(
        "Chúng tôi trân trọng giới thiệu dòng xe điện mới với quãng đường dài hơn và công nghệ an toàn nâng cao.",
        "We are pleased to introduce a new electric lineup with extended range and enhanced safety technology."
      ),
      published: true,
      featured: true,
      publishedAt: new Date(),
    },
  });

  // Policy
  await prisma.policyDocument.upsert({
    where: { id: "seed-policy-privacy" },
    update: {},
    create: {
      id: "seed-policy-privacy",
      slug: bi("chinh-sach-bao-mat", "privacy-policy"),
      title: bi("Chính sách bảo mật", "Privacy policy"),
      body: bi(
        "Chúng tôi thu thập thông tin liên hệ để tư vấn bán hàng. Không chia sẻ cho bên thứ ba.",
        "We collect contact information for sales consultation. We do not share with third parties."
      ),
      sortOrder: 1,
    },
  });

  // Admin user (dev)
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${adminEmail} / (from ADMIN_PASSWORD env or default "change-me")`);
  console.log("Run npm run db:seed:media to purge R2, upload images, and save public URLs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
