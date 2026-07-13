/**
 * Infrastructure seed — units, attributes, admin, site shell (no vehicles).
 */
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

export async function runBootstrap() {
  console.log("Bootstrap seed…");

  const units = [
    { key: "km", value: bi("km", "km") },
    { key: "kW", value: bi("kW", "kW") },
    { key: "kWh", value: bi("kWh", "kWh") },
    { key: "seats", value: bi("chỗ", "seats") },
    { key: "kg", value: bi("kg", "kg") },
  ];
  for (const unit of units) {
    await prisma.unit.upsert({ where: { key: unit.key }, update: { value: unit.value }, create: unit });
  }

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

  const templates = [
    { key: "electric-suv-standard", name: bi("SUV điện tiêu chuẩn", "Standard electric SUV"), items: suvTemplateItems },
    { key: "electric-mpv-standard", name: bi("MPV điện tiêu chuẩn", "Standard electric MPV"), items: mpvTemplateItems },
    { key: "commercial-van", name: bi("Xe tải thương mại", "Commercial van"), items: vanTemplateItems },
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
      vi: { title: "Về đại lý", body: "Chúng tôi là đại lý phân phối xe điện." },
      en: { title: "About our dealership", body: "We are an authorized electric vehicle dealer." },
    },
    socialLinks: [
      { platform: "facebook", url: "https://facebook.com/" },
      { platform: "zalo", url: "https://zalo.me/1900123456" },
    ],
    seoDefaults: {
      vi: { title: "Đại lý Ô tô Mẫu", description: "Khám phá xe điện mới." },
      en: { title: "Sample Auto Dealer", description: "Explore new electric vehicles." },
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

  const showroom = await prisma.showroom.upsert({
    where: { id: "seed-showroom-1" },
    update: {},
    create: {
      id: "seed-showroom-1",
      name: bi("Showroom Trung tâm", "Central Showroom"),
      address: bi("123 Đường Mẫu, Quận 1", "123 Sample Street, District 1"),
      city: "Ho Chi Minh City",
      phone: "1900123456",
      hours: bi("T2–CN: 8:00–20:00", "Mon–Sun: 8:00 AM–8:00 PM"),
      typeTag: "2S",
      sortOrder: 1,
    },
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

  const menuItems = [
    { id: "seed-menu-news", label: bi("Tin tức", "News"), routeKey: "/news", placement: "HEADER", sortOrder: 2 },
    { id: "seed-menu-about", label: bi("Về chúng tôi", "About"), routeKey: "/about", placement: "HEADER", sortOrder: 3 },
    { id: "seed-menu-footer-news", label: bi("Tin tức khuyến mãi", "News & Campaigns"), routeKey: "/news", placement: "FOOTER", sortOrder: 4 },
    { id: "seed-menu-contact", label: bi("Liên hệ", "Contact"), routeKey: "/contact", placement: "FOOTER", sortOrder: 6 },
  ];
  for (const item of menuItems) {
    await prisma.menuItem.upsert({ where: { id: item.id }, update: item, create: item });
  }

  for (const page of [
    { pageType: "about", slug: bi("ve-chung-toi", "about"), title: bi("Về chúng tôi", "About us"), body: bi("Đại lý xe điện.", "Electric vehicle dealer.") },
    { pageType: "contact", slug: bi("lien-he", "contact"), title: bi("Liên hệ", "Contact"), body: bi("Hotline: 1900123456", "Hotline: 1900123456") },
  ]) {
    await prisma.page.upsert({ where: { pageType: page.pageType }, update: page, create: page });
  }

  await prisma.serviceBlock.upsert({
    where: { id: "seed-service-test-drive" },
    update: {},
    create: {
      id: "seed-service-test-drive",
      title: bi("Lái thử", "Test drive"),
      description: bi("Trải nghiệm xe tại showroom.", "Experience vehicles at our showroom."),
      iconKey: "steering-wheel",
      linkRouteKey: "/book-test-drive",
      sortOrder: 1,
    },
  });

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

  console.log(`Bootstrap complete. Admin: ${adminEmail}`);
}

async function main() {
  await runBootstrap();
}

if (process.argv[1]?.endsWith("seed-bootstrap.js")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
