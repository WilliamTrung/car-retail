// Mock test data modeled on reference dealer/OEM site structure (URLs in docs/project-context.md).
// Structure, specs and price points mirror the real lineup; names/copy are original ("Velo" brand)
// per docs/project-context.md asset checklist. Run: npm run db:seed:mock
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function bi(vi, en) {
  return { vi, en };
}

// --- Units & attribute keys ---

const units = [
  { key: "km", value: bi("km", "km") },
  { key: "kW", value: bi("kW", "kW") },
  { key: "kWh", value: bi("kWh", "kWh") },
  { key: "Nm", value: bi("Nm", "Nm") },
  { key: "mm", value: bi("mm", "mm") },
  { key: "min", value: bi("phút", "min") },
  { key: "L", value: bi("L", "L") },
  { key: "kg", value: bi("kg", "kg") },
  { key: "seats", value: bi("chỗ", "seats") },
];

const attributeKeys = [
  { key: "range", groupKey: "performance", sortOrder: 1 },
  { key: "power", groupKey: "performance", sortOrder: 2 },
  { key: "torque", groupKey: "performance", sortOrder: 3 },
  { key: "battery", groupKey: "performance", sortOrder: 4 },
  { key: "batteryType", groupKey: "performance", sortOrder: 5 },
  { key: "chargeTimeFast", groupKey: "performance", sortOrder: 6 },
  { key: "drivetrain", groupKey: "performance", sortOrder: 7 },
  { key: "wheelbase", groupKey: "dimensions", sortOrder: 8 },
  { key: "seats", groupKey: "dimensions", sortOrder: 9 },
  { key: "trunk", groupKey: "dimensions", sortOrder: 10 },
  { key: "airbags", groupKey: "safety", sortOrder: 11 },
  { key: "payload", groupKey: "cargo", sortOrder: 12 },
];

// --- Vehicle catalog ---
// lines: personal (suv, mpv) / commercial (green, van)
// Spec sources: OEM deposit page spec strips (power, range NEDC, wheelbase) + model pages.

const models = [
  {
    id: "mock-model-x3",
    segment: "suv",
    name: "Velo X3",
    slug: bi("velo-x3", "velo-x3"),
    tagline: bi("Bạn đồng hành nhỏ gọn của phố thị", "Your compact city companion"),
    description: bi(
      "SUV điện cỡ nhỏ 4 chỗ, quãng đường 210 km, dễ dàng luồn lách và đỗ xe trong đô thị đông đúc.",
      "A 4-seat mini electric SUV with 210 km of range, built for tight streets and easy city parking."
    ),
    attributes: [
      { key: "range", value: 210, unit: "km" },
      { key: "power", value: 30, unit: "kW" },
      { key: "torque", value: 110, unit: "Nm" },
      { key: "battery", value: 18.64, unit: "kWh" },
      { key: "batteryType", value: "LFP" },
      { key: "chargeTimeFast", value: 36, unit: "min" },
      { key: "drivetrain", value: "RWD" },
      { key: "wheelbase", value: 2065, unit: "mm" },
      { key: "seats", value: 4, unit: "seats" },
    ],
    variants: [
      { id: "mock-variant-x3-eco", name: bi("Eco", "Eco"), price: 299000000 },
      { id: "mock-variant-x3-plus", name: bi("Plus", "Plus"), price: 315000000 },
    ],
  },
  {
    id: "mock-model-x5",
    segment: "suv",
    name: "Velo X5",
    slug: bi("velo-x5", "velo-x5"),
    tagline: bi("Khởi đầu xu hướng sống điện", "Start your electric lifestyle"),
    description: bi(
      "A-SUV điện 5 chỗ với pin LFP 37,23 kWh, quãng đường 326 km và chi phí vận hành tối ưu.",
      "A 5-seat electric A-SUV with a 37.23 kWh LFP battery, 326 km range and low running costs."
    ),
    attributes: [
      { key: "range", value: 326, unit: "km" },
      { key: "power", value: 100, unit: "kW" },
      { key: "torque", value: 135, unit: "Nm" },
      { key: "battery", value: 37.23, unit: "kWh" },
      { key: "batteryType", value: "LFP" },
      { key: "chargeTimeFast", value: 30, unit: "min" },
      { key: "drivetrain", value: "FWD" },
      { key: "wheelbase", value: 2514, unit: "mm" },
      { key: "seats", value: 5, unit: "seats" },
    ],
    variants: [{ id: "mock-variant-x5-plus", name: bi("Plus", "Plus"), price: 529000000 }],
  },
  {
    id: "mock-model-x6",
    segment: "suv",
    name: "Velo X6",
    slug: bi("velo-x6", "velo-x6"),
    tagline: bi("Sẵn sàng cho mọi hành trình", "Ready for every journey"),
    description: bi(
      "B-SUV điện 5 chỗ, công suất tới 150 kW, quãng đường tới 480 km cho cả phố và đường dài.",
      "A 5-seat electric B-SUV with up to 150 kW and up to 480 km of range for city and highway alike."
    ),
    attributes: [
      { key: "range", value: 480, unit: "km" },
      { key: "power", value: 150, unit: "kW" },
      { key: "battery", value: 59.6, unit: "kWh" },
      { key: "drivetrain", value: "FWD" },
      { key: "wheelbase", value: 2730, unit: "mm" },
      { key: "seats", value: 5, unit: "seats" },
    ],
    variants: [
      {
        id: "mock-variant-x6-eco",
        name: bi("Eco", "Eco"),
        price: 689000000,
        attributes: [
          { key: "power", value: 130, unit: "kW" },
          { key: "range", value: 485, unit: "km" },
        ],
      },
      {
        id: "mock-variant-x6-plus",
        name: bi("Plus", "Plus"),
        price: 745000000,
        attributes: [
          { key: "power", value: 150, unit: "kW" },
          { key: "range", value: 460, unit: "km" },
        ],
      },
    ],
  },
  {
    id: "mock-model-x7",
    segment: "suv",
    name: "Velo X7",
    slug: bi("velo-x7", "velo-x7"),
    tagline: bi("Đam mê dẫn đường", "Driven by passion"),
    description: bi(
      "C-SUV điện thể thao với hai tùy chọn dẫn động FWD/AWD, công suất tới 260 kW và trần kính toàn cảnh.",
      "A sporty electric C-SUV with FWD/AWD options, up to 260 kW and a panoramic glass roof."
    ),
    attributes: [
      { key: "range", value: 496, unit: "km" },
      { key: "power", value: 260, unit: "kW" },
      { key: "battery", value: 75.3, unit: "kWh" },
      { key: "wheelbase", value: 2840, unit: "mm" },
      { key: "seats", value: 5, unit: "seats" },
    ],
    variants: [
      {
        id: "mock-variant-x7-eco",
        name: bi("Eco", "Eco"),
        price: 789000000,
        attributes: [
          { key: "power", value: 130, unit: "kW" },
          { key: "range", value: 440, unit: "km" },
          { key: "drivetrain", value: "FWD" },
        ],
      },
      {
        id: "mock-variant-x7-plus",
        name: bi("Plus", "Plus"),
        price: 889000000,
        attributes: [
          { key: "power", value: 260, unit: "kW" },
          { key: "range", value: 496, unit: "km" },
          { key: "drivetrain", value: "AWD" },
        ],
      },
    ],
  },
  {
    id: "mock-model-x8",
    segment: "suv",
    name: "Velo X8",
    slug: bi("velo-x8", "velo-x8"),
    tagline: bi("Hơn cả sự phấn khích", "Beyond exhilaration"),
    description: bi(
      "D-SUV điện 5 chỗ với màn hình trung tâm 15,6 inch, trợ lái ADAS và quãng đường tới 562 km.",
      "A 5-seat electric D-SUV with a 15.6-inch center display, ADAS assistance and up to 562 km of range."
    ),
    attributes: [
      { key: "range", value: 562, unit: "km" },
      { key: "power", value: 300, unit: "kW" },
      { key: "battery", value: 87.7, unit: "kWh" },
      { key: "wheelbase", value: 2950, unit: "mm" },
      { key: "seats", value: 5, unit: "seats" },
      { key: "trunk", value: 376, unit: "L" },
      { key: "airbags", value: 11 },
    ],
    variants: [
      {
        id: "mock-variant-x8-eco",
        name: bi("Eco", "Eco"),
        price: 1019000000,
        attributes: [
          { key: "power", value: 150, unit: "kW" },
          { key: "range", value: 562, unit: "km" },
          { key: "airbags", value: 10 },
        ],
      },
      {
        id: "mock-variant-x8-plus",
        name: bi("Plus", "Plus"),
        price: 1199000000,
        attributes: [
          { key: "power", value: 300, unit: "kW" },
          { key: "range", value: 457, unit: "km" },
          { key: "airbags", value: 11 },
        ],
      },
    ],
    faqs: [
      {
        id: "mock-faq-x8-warranty",
        question: bi("Velo X8 được bảo hành bao lâu?", "How long is the Velo X8 warranty?"),
        answer: bi(
          "Xe mới và pin cao áp được bảo hành 10 năm hoặc 200.000 km, tùy điều kiện nào đến trước (sử dụng tiêu chuẩn).",
          "New vehicle and high-voltage battery are covered for 10 years or 200,000 km, whichever comes first (standard use)."
        ),
      },
      {
        id: "mock-faq-x8-adas",
        question: bi("Velo X8 có những tính năng trợ lái nào?", "What driver-assist features does the Velo X8 have?"),
        answer: bi(
          "Kiểm soát hành trình thích ứng, giữ làn, cảnh báo điểm mù, phanh khẩn cấp tự động và cảnh báo va chạm phía trước.",
          "Adaptive cruise control, lane keeping, blind-spot warning, automatic emergency braking and forward collision warning."
        ),
      },
      {
        id: "mock-faq-x8-trunk",
        question: bi("Khoang hành lý Velo X8 rộng bao nhiêu?", "How big is the Velo X8 cargo space?"),
        answer: bi(
          "376 L phía sau, 1.373 L khi gập hàng ghế thứ hai, cộng thêm cốp trước 88 L.",
          "376 L behind the second row, 1,373 L with it folded, plus an 88 L front trunk."
        ),
      },
    ],
    featureSections: [
      {
        id: "mock-feature-x8-cabin",
        title: bi("Khoang lái công nghệ", "Tech-first cabin"),
        body: bi(
          "Màn hình cảm ứng trung tâm 15,6 inch, hiển thị kính lái HUD và ghế chỉnh điện nhớ vị trí, thông gió, sưởi ấm.",
          "A 15.6-inch center touchscreen, head-up display and memory power seats with ventilation and heating."
        ),
      },
      {
        id: "mock-feature-x8-safety",
        title: bi("An toàn chủ động toàn diện", "Comprehensive active safety"),
        body: bi(
          "Tới 11 túi khí cùng ABS, EBD, BA, cân bằng điện tử ESC và bộ tính năng trợ lái nâng cao.",
          "Up to 11 airbags with ABS, EBD, BA, electronic stability control and an advanced driver-assist suite."
        ),
      },
    ],
  },
  {
    id: "mock-model-x9",
    segment: "suv",
    name: "Velo X9",
    slug: bi("velo-x9", "velo-x9"),
    tagline: bi("Đẳng cấp cho cả gia đình", "First-class family travel"),
    description: bi(
      "E-SUV điện 6–7 chỗ đầu bảng, quãng đường tới 626 km, tùy chọn ghế cơ trưởng cho hàng ghế hai.",
      "The flagship 6–7 seat electric E-SUV with up to 626 km of range and optional captain seats."
    ),
    attributes: [
      { key: "range", value: 626, unit: "km" },
      { key: "power", value: 300, unit: "kW" },
      { key: "battery", value: 123, unit: "kWh" },
      { key: "drivetrain", value: "AWD" },
      { key: "wheelbase", value: 3149, unit: "mm" },
      { key: "seats", value: 7, unit: "seats" },
    ],
    variants: [
      {
        id: "mock-variant-x9-eco",
        name: bi("Eco", "Eco"),
        price: 1499000000,
        attributes: [{ key: "range", value: 602, unit: "km" }],
      },
      {
        id: "mock-variant-x9-plus",
        name: bi("Plus 7 chỗ", "Plus 7-seat"),
        price: 1699000000,
        attributes: [{ key: "range", value: 626, unit: "km" }],
      },
      {
        id: "mock-variant-x9-plus-captain",
        name: bi("Plus ghế cơ trưởng", "Plus captain seats"),
        price: 1731000000,
        attributes: [
          { key: "range", value: 626, unit: "km" },
          { key: "seats", value: 6, unit: "seats" },
        ],
      },
    ],
  },
  {
    id: "mock-model-m7",
    segment: "mpv",
    name: "Velo M7",
    slug: bi("velo-m7", "velo-m7"),
    tagline: bi("Không gian cho mọi chuyến đi", "Room for every trip"),
    description: bi(
      "MPV điện 7 chỗ với quãng đường 450 km, tối ưu cho gia đình đông thành viên và di chuyển liên tỉnh.",
      "A 7-seat electric MPV with 450 km of range, ideal for big families and intercity travel."
    ),
    attributes: [
      { key: "range", value: 450, unit: "km" },
      { key: "power", value: 150, unit: "kW" },
      { key: "wheelbase", value: 2840, unit: "mm" },
      { key: "seats", value: 7, unit: "seats" },
    ],
    variants: [{ id: "mock-variant-m7-std", name: bi("Tiêu chuẩn", "Standard"), price: 819000000 }],
  },
  {
    id: "mock-model-mini-green",
    segment: "green",
    name: "Velo Mini Green",
    slug: bi("velo-mini-green", "velo-mini-green"),
    tagline: bi("Nhỏ gọn cho dịch vụ nội đô", "Compact urban service car"),
    description: bi(
      "Xe điện cỡ nhỏ cho dịch vụ vận tải hành khách nội đô, chi phí đầu tư thấp, quãng đường 210 km.",
      "A mini EV for urban ride services with low upfront cost and 210 km of range."
    ),
    attributes: [
      { key: "range", value: 210, unit: "km" },
      { key: "power", value: 30, unit: "kW" },
      { key: "wheelbase", value: 2065, unit: "mm" },
      { key: "seats", value: 4, unit: "seats" },
    ],
    variants: [{ id: "mock-variant-mini-green-std", name: bi("Tiêu chuẩn", "Standard"), price: 269000000 }],
  },
  {
    id: "mock-model-h5-green",
    segment: "green",
    name: "Velo H5 Green",
    slug: bi("velo-h5-green", "velo-h5-green"),
    tagline: bi("Tối ưu chi phí mỗi chuyến xe", "Optimized cost per ride"),
    description: bi(
      "SUV điện 5 chỗ cho dịch vụ, quãng đường 326 km, tối ưu chi phí năng lượng so với xe xăng cùng cỡ.",
      "A 5-seat service EV with 326 km of range and lower energy cost than comparable petrol cars."
    ),
    attributes: [
      { key: "range", value: 326, unit: "km" },
      { key: "power", value: 110, unit: "kW" },
      { key: "wheelbase", value: 2514, unit: "mm" },
      { key: "seats", value: 5, unit: "seats" },
    ],
    variants: [
      { id: "mock-variant-h5-green-1", name: bi("Tiêu chuẩn 1", "Standard 1"), price: 499000000 },
      { id: "mock-variant-h5-green-2", name: bi("Tiêu chuẩn 2", "Standard 2"), price: 479000000 },
    ],
  },
  {
    id: "mock-model-l7-green",
    segment: "green",
    name: "Velo L7 Green",
    slug: bi("velo-l7-green", "velo-l7-green"),
    tagline: bi("Dịch vụ 7 chỗ đẳng cấp", "Premium 7-seat service"),
    description: bi(
      "MPV điện 7 chỗ cho dịch vụ cao cấp, quãng đường 450 km, khoang hành khách rộng rãi.",
      "A 7-seat electric MPV for premium ride services with 450 km of range and a spacious cabin."
    ),
    attributes: [
      { key: "range", value: 450, unit: "km" },
      { key: "power", value: 150, unit: "kW" },
      { key: "wheelbase", value: 2840, unit: "mm" },
      { key: "seats", value: 7, unit: "seats" },
    ],
    variants: [{ id: "mock-variant-l7-green-std", name: bi("Tiêu chuẩn", "Standard"), price: 749000000 }],
  },
  {
    id: "mock-model-cargo-van",
    segment: "van",
    name: "Velo Cargo Van",
    slug: bi("velo-cargo-van", "velo-cargo-van"),
    tagline: bi("Giảm chi phí, tăng lợi nhuận", "Cut costs, grow profit"),
    description: bi(
      "Van điện chở hàng nội đô với quãng đường 175 km, tùy chọn cửa trượt, tối ưu cho giao vận chặng cuối.",
      "An urban electric cargo van with 175 km of range and optional sliding doors, built for last-mile delivery."
    ),
    attributes: [
      { key: "range", value: 175, unit: "km" },
      { key: "power", value: 30, unit: "kW" },
      { key: "wheelbase", value: 2520, unit: "mm" },
      { key: "seats", value: 2, unit: "seats" },
      { key: "payload", value: 600, unit: "kg" },
    ],
    variants: [
      { id: "mock-variant-van-std", name: bi("Tiêu chuẩn", "Standard"), price: 285000000 },
      { id: "mock-variant-van-plus", name: bi("Nâng cao - Không cửa trượt", "Advanced - No sliding door"), price: 305000000 },
      { id: "mock-variant-van-plus-slide", name: bi("Nâng cao - Có cửa trượt", "Advanced - Sliding door"), price: 325000000 },
    ],
  },
];

// --- Showrooms & hotlines (dealer-site pattern: multi-showroom + per-showroom hotline) ---

const showrooms = [
  {
    id: "mock-showroom-1",
    name: bi("Showroom Đông Thành 1", "Dong Thanh Showroom 1"),
    address: bi("391 Đại lộ Ven Sông, Phường An Khánh, TP. Hồ Chí Minh", "391 Riverside Blvd, An Khanh Ward, Ho Chi Minh City"),
    city: "Ho Chi Minh City",
    phone: "0900111222",
    hours: bi("T2–CN: 8:00–19:00", "Mon–Sun: 8:00 AM–7:00 PM"),
    typeTag: "3S",
    sortOrder: 1,
  },
  {
    id: "mock-showroom-2",
    name: bi("Showroom Đông Thành 2", "Dong Thanh Showroom 2"),
    address: bi("682A Đường Vành Đai, Phường Tân Bình, TP. Hồ Chí Minh", "682A Ring Road, Tan Binh Ward, Ho Chi Minh City"),
    city: "Ho Chi Minh City",
    phone: "0900333444",
    hours: bi("T2–CN: 8:00–19:00", "Mon–Sun: 8:00 AM–7:00 PM"),
    typeTag: "3S",
    sortOrder: 2,
  },
  {
    id: "mock-showroom-3",
    name: bi("Showroom Đông Thành 3", "Dong Thanh Showroom 3"),
    address: bi("20 Đường Trung Tâm, Phường Bảy Hiền, TP. Hồ Chí Minh", "20 Central Street, Bay Hien Ward, Ho Chi Minh City"),
    city: "Ho Chi Minh City",
    phone: "0900555666",
    hours: bi("T2–T7: 8:00–18:00", "Mon–Sat: 8:00 AM–6:00 PM"),
    typeTag: "2S",
    sortOrder: 3,
  },
  {
    id: "mock-showroom-4",
    name: bi("Showroom Đông Thành 4", "Dong Thanh Showroom 4"),
    address: bi("616 Đường Hoa Mai, Phường Bảy Hiền, TP. Hồ Chí Minh", "616 Hoa Mai Street, Bay Hien Ward, Ho Chi Minh City"),
    city: "Ho Chi Minh City",
    phone: "0900777888",
    hours: bi("T2–T7: 8:00–18:00", "Mon–Sat: 8:00 AM–6:00 PM"),
    typeTag: "1S",
    sortOrder: 4,
  },
];

const hotlines = [
  { id: "mock-hotline-sales", label: bi("Kinh doanh", "Sales"), phone: "0900111222", sortOrder: 1, showroomId: "mock-showroom-1" },
  { id: "mock-hotline-service-1", label: bi("Dịch vụ - Chi nhánh 2", "Service - Branch 2"), phone: "0900333444", sortOrder: 2, showroomId: "mock-showroom-2" },
  { id: "mock-hotline-service-2", label: bi("Dịch vụ - Chi nhánh 3", "Service - Branch 3"), phone: "0900555666", sortOrder: 3, showroomId: "mock-showroom-3" },
  { id: "mock-hotline-parts", label: bi("Phụ tùng phụ kiện", "Parts & accessories"), phone: "0900777888", sortOrder: 4, showroomId: "mock-showroom-4" },
  { id: "mock-hotline-247", label: bi("Cứu hộ 24/7", "24/7 roadside assistance"), phone: "0900999000", sortOrder: 5, showroomId: null },
];

// --- Homepage CMS ---

const heroSlides = [
  {
    id: "mock-hero-summer",
    title: bi("Ưu đãi hè rực rỡ", "Bright summer deals"),
    subtitle: bi("Giảm tới 6% cho toàn bộ dòng SUV điện trong tháng này", "Up to 6% off the entire electric SUV lineup this month"),
    ctaLabel: bi("Đăng ký lái thử", "Book a test drive"),
    ctaRouteKey: "/book-test-drive",
    sortOrder: 1,
  },
  {
    id: "mock-hero-m7",
    title: bi("Velo M7 — MPV điện cho gia đình", "Velo M7 — the family electric MPV"),
    subtitle: bi("Ưu đãi lên đến 124 triệu đồng khi đặt cọc trong tháng", "Save up to 124 million VND when you place a deposit this month"),
    ctaLabel: bi("Đặt cọc ngay", "Place a deposit"),
    ctaRouteKey: "/deposit",
    sortOrder: 2,
  },
  {
    id: "mock-hero-x3",
    title: bi("Velo X3 — chỉ từ 299 triệu", "Velo X3 — from just 299 million"),
    subtitle: bi("Nhỏ gọn trong phố, sẵn sàng mọi cuối tuần", "Compact in the city, ready for every weekend"),
    ctaLabel: bi("Xem chi tiết", "See details"),
    ctaRouteKey: "/velo-x3",
    sortOrder: 3,
  },
];

const serviceBlocks = [
  {
    id: "mock-service-offers",
    title: bi("Ưu đãi mỗi tháng", "Monthly offers"),
    description: bi(
      "Chương trình khuyến mãi cập nhật hàng tháng tại showroom.",
      "Fresh monthly promotions at every showroom."
    ),
    iconKey: "tag",
    sortOrder: 1,
  },
  {
    id: "mock-service-installment",
    title: bi("Trả góp đến 90%", "Installment up to 90%"),
    description: bi(
      "Hỗ trợ vay ngân hàng, thủ tục nhanh chóng.",
      "Bank financing support with fast paperwork."
    ),
    iconKey: "percent",
    sortOrder: 2,
  },
  {
    id: "mock-service-test-drive",
    title: bi("Lái thử miễn phí", "Free test drive"),
    description: bi("Trải nghiệm mọi mẫu xe tại showroom.", "Experience any model at our showrooms."),
    iconKey: "steering-wheel",
    linkRouteKey: "/book-test-drive",
    sortOrder: 3,
  },
  {
    id: "mock-service-3s",
    title: bi("Dịch vụ 3S", "3S service"),
    description: bi(
      "Bán hàng, bảo dưỡng và phụ tùng chính hãng.",
      "Sales, service, and genuine spare parts."
    ),
    iconKey: "wrench",
    sortOrder: 4,
  },
];

// --- News ---

const newsPosts = [
  {
    id: "mock-news-pricing",
    slug: bi("chinh-sach-gia-moi-thang-7", "new-pricing-july"),
    title: bi("Chính sách giá mới áp dụng từ tháng 7", "New pricing policy effective July"),
    excerpt: bi("Cập nhật giá bán toàn bộ dòng xe điện cùng ưu đãi màu nâng cao.", "Updated prices across the EV lineup plus premium color offers."),
    body: bi(
      "Từ tháng 7, giá niêm yết các dòng SUV điện được điều chỉnh cùng nhiều gói ưu đãi: giảm 6% giá xe, hỗ trợ chi phí sạc và tặng bộ sạc tại nhà cho khách đặt cọc sớm.",
      "Starting in July, list prices across the electric SUV lineup are adjusted with several offers: 6% off, charging-cost support and a free home charger for early deposits."
    ),
    published: true,
    featured: true,
    daysAgo: 2,
  },
  {
    id: "mock-news-m7-launch",
    slug: bi("ra-mat-velo-m7", "velo-m7-launch"),
    title: bi("Ra mắt Velo M7: MPV điện 7 chỗ", "Velo M7 launch: the 7-seat electric MPV"),
    excerpt: bi("Quãng đường 450 km, giá từ 819 triệu đồng.", "450 km of range, priced from 819 million VND."),
    body: bi(
      "Velo M7 chính thức nhận cọc với một phiên bản Tiêu chuẩn, quãng đường 450 km (NEDC), công suất 150 kW và khoang 7 chỗ rộng rãi cho gia đình.",
      "The Velo M7 is now open for deposits in a single Standard trim with 450 km NEDC range, 150 kW of power and a roomy 7-seat cabin."
    ),
    published: true,
    featured: true,
    daysAgo: 7,
  },
  {
    id: "mock-news-warranty",
    slug: bi("bao-hanh-10-nam", "10-year-warranty"),
    title: bi("Bảo hành 10 năm cho toàn bộ xe điện", "10-year warranty on all EVs"),
    excerpt: bi("Chính sách bảo hành mới áp dụng cho xe và pin cao áp.", "New warranty policy covers both vehicle and high-voltage battery."),
    body: bi(
      "Toàn bộ xe điện bán mới được bảo hành 10 năm hoặc 200.000 km cho cả xe và pin cao áp — mức cam kết cao nhất phân khúc, áp dụng điều kiện sử dụng tiêu chuẩn.",
      "All new EVs come with a 10-year / 200,000 km warranty covering both vehicle and high-voltage battery — the strongest commitment in the segment under standard use."
    ),
    published: true,
    featured: true,
    daysAgo: 14,
  },
];

// --- Global FAQ ---

const faqItems = [
  {
    id: "mock-faq-battery-rental",
    question: bi("Giá xe đã bao gồm pin chưa?", "Does the price include the battery?"),
    answer: bi(
      "Giá niêm yết đã bao gồm pin. Khách hàng cũng có thể chọn phương án thuê pin để giảm chi phí ban đầu.",
      "List prices include the battery. A battery rental plan is also available to lower the upfront cost."
    ),
    sortOrder: 1,
  },
  {
    id: "mock-faq-deposit",
    question: bi("Đặt cọc bao nhiêu và có hoàn lại không?", "How much is the deposit and is it refundable?"),
    answer: bi(
      "Mức cọc tiêu chuẩn là 50 triệu đồng. Điều kiện hoàn cọc theo thỏa thuận đặt cọc tại thời điểm đặt mua.",
      "The standard deposit is 50 million VND. Refund terms follow the deposit agreement at time of order."
    ),
    sortOrder: 2,
  },
  {
    id: "mock-faq-charge",
    question: bi("Sạc xe ở đâu?", "Where can I charge?"),
    answer: bi(
      "Tại nhà bằng bộ sạc treo tường hoặc sạc cầm tay, hoặc tại hệ thống trạm sạc công cộng trên toàn quốc.",
      "At home with a wallbox or portable charger, or at the nationwide public charging network."
    ),
    sortOrder: 3,
  },
];

// --- Sample leads ---

const leads = [
  {
    id: "mock-lead-testdrive-1",
    type: "TEST_DRIVE",
    status: "NEW",
    locale: "vi",
    modelId: "mock-model-x6",
    showroomId: "mock-showroom-1",
    payload: {
      name: "Nguyễn Văn An",
      phone: "0912345678",
      email: "an.nguyen@example.com",
      date: "2026-07-18",
      time: "09:30",
      consent: true,
    },
  },
  {
    id: "mock-lead-testdrive-2",
    type: "TEST_DRIVE",
    status: "CONTACTED",
    locale: "en",
    modelId: "mock-model-x8",
    showroomId: "mock-showroom-2",
    payload: {
      name: "David Miller",
      phone: "0987654321",
      email: "david.m@example.com",
      date: "2026-07-20",
      time: "14:00",
      consent: true,
    },
    notes: "Called 2026-07-10, confirmed appointment.",
  },
  {
    id: "mock-lead-deposit-1",
    type: "DEPOSIT",
    status: "NEW",
    locale: "vi",
    modelId: "mock-model-m7",
    variantId: "mock-variant-m7-std",
    showroomId: "mock-showroom-1",
    payload: {
      name: "Trần Thị Bình",
      phone: "0909090909",
      email: "binh.tran@example.com",
      exteriorColor: "white",
      consent: true,
    },
  },
  {
    id: "mock-lead-consult-1",
    type: "CONSULT",
    status: "CLOSED",
    locale: "vi",
    modelId: "mock-model-cargo-van",
    payload: {
      name: "Công ty Giao Vận Nhanh",
      phone: "02838383838",
      email: "fleet@example.com",
      message: "Cần báo giá 10 xe van cho đội giao hàng.",
      consent: true,
    },
    notes: "Fleet quote sent, moved to sales pipeline.",
  },
];

async function main() {
  console.log("Seeding mock test data…");

  for (const unit of units) {
    await prisma.unit.upsert({ where: { key: unit.key }, update: { value: unit.value }, create: unit });
  }

  for (const ak of attributeKeys) {
    await prisma.attributeKey.upsert({
      where: { key: ak.key },
      update: { groupKey: ak.groupKey, sortOrder: ak.sortOrder },
      create: ak,
    });
  }

  // Lines & segments
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

  const segmentDefs = [
    { key: "suv", lineId: personalLine.id, name: bi("SUV", "SUV"), sortOrder: 1 },
    { key: "mpv", lineId: personalLine.id, name: bi("MPV", "MPV"), sortOrder: 2 },
    { key: "green", lineId: commercialLine.id, name: bi("Dòng xe dịch vụ", "Service fleet"), sortOrder: 1 },
    { key: "van", lineId: commercialLine.id, name: bi("Van", "Van"), sortOrder: 2 },
  ];
  const segments = {};
  for (const seg of segmentDefs) {
    segments[seg.key] = await prisma.vehicleSegment.upsert({
      where: { lineId_key: { lineId: seg.lineId, key: seg.key } },
      update: { name: seg.name, sortOrder: seg.sortOrder },
      create: seg,
    });
  }

  // Models, variants, FAQs, feature sections
  for (const [index, m] of models.entries()) {
    const data = {
      segmentId: segments[m.segment].id,
      name: bi(m.name, m.name),
      slug: m.slug,
      tagline: m.tagline,
      description: m.description,
      attributes: m.attributes,
      published: true,
      sortOrder: index + 1,
    };
    await prisma.vehicleModel.upsert({ where: { id: m.id }, update: data, create: { id: m.id, ...data } });

    for (const [vIndex, v] of m.variants.entries()) {
      const variantData = {
        modelId: m.id,
        name: v.name,
        price: v.price,
        attributes: v.attributes ?? [],
        published: true,
        sortOrder: vIndex + 1,
      };
      await prisma.vehicleVariant.upsert({ where: { id: v.id }, update: variantData, create: { id: v.id, ...variantData } });
    }

    for (const [fIndex, faq] of (m.faqs ?? []).entries()) {
      const faqData = { modelId: m.id, question: faq.question, answer: faq.answer, sortOrder: fIndex + 1 };
      await prisma.modelFaq.upsert({ where: { id: faq.id }, update: faqData, create: { id: faq.id, ...faqData } });
    }

    for (const [sIndex, section] of (m.featureSections ?? []).entries()) {
      const sectionData = { modelId: m.id, title: section.title, body: section.body, sortOrder: sIndex + 1 };
      await prisma.featureSection.upsert({ where: { id: section.id }, update: sectionData, create: { id: section.id, ...sectionData } });
    }
  }

  for (const s of showrooms) {
    await prisma.showroom.upsert({ where: { id: s.id }, update: s, create: s });
  }
  for (const h of hotlines) {
    await prisma.hotline.upsert({ where: { id: h.id }, update: h, create: h });
  }

  for (const slide of heroSlides) {
    await prisma.heroSlide.upsert({ where: { id: slide.id }, update: slide, create: slide });
  }
  for (const block of serviceBlocks) {
    await prisma.serviceBlock.upsert({ where: { id: block.id }, update: block, create: block });
  }

  for (const post of newsPosts) {
    const { daysAgo, ...rest } = post;
    const data = { ...rest, publishedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) };
    await prisma.newsPost.upsert({ where: { id: post.id }, update: data, create: data });
  }

  for (const faq of faqItems) {
    await prisma.faqItem.upsert({ where: { id: faq.id }, update: faq, create: faq });
  }

  for (const lead of leads) {
    await prisma.lead.upsert({ where: { id: lead.id }, update: lead, create: lead });
  }

  console.log(`Mock seed complete: ${models.length} models, ${showrooms.length} showrooms, ${newsPosts.length} news posts, ${leads.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
