/** AUTO-GENERATED — dev reference seed (13 models). Regenerate: npm run scrape:generate */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function bi(vi, en) {
  return { vi, en: en || vi };
}

export async function runScrapedSeed() {
  console.log("Scraped catalog seed…");

  const lineIds = {};
  lineIds["commercial"] = (await prisma.vehicleLine.upsert({
    where: { key: "commercial" },
    update: {},
    create: { key: "commercial", name: bi("Xe thương mại", "Commercial vehicles"), sortOrder: 1 },
  })).id;
  lineIds["personal"] = (await prisma.vehicleLine.upsert({
    where: { key: "personal" },
    update: {},
    create: { key: "personal", name: bi("Xe cá nhân", "Personal vehicles"), sortOrder: 2 },
  })).id;

  const segmentIds = {};
  segmentIds["van"] = (await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: lineIds["commercial"], key: "van" } },
    update: {},
    create: { lineId: lineIds["commercial"], key: "van", name: bi("VAN", "VAN"), sortOrder: 1 },
  })).id;
  segmentIds["sedan"] = (await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: lineIds["personal"], key: "sedan" } },
    update: {},
    create: { lineId: lineIds["personal"], key: "sedan", name: bi("SEDAN", "SEDAN"), sortOrder: 2 },
  })).id;
  segmentIds["mpv"] = (await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: lineIds["personal"], key: "mpv" } },
    update: {},
    create: { lineId: lineIds["personal"], key: "mpv", name: bi("MPV", "MPV"), sortOrder: 3 },
  })).id;
  segmentIds["suv"] = (await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: lineIds["personal"], key: "suv" } },
    update: {},
    create: { lineId: lineIds["personal"], key: "suv", name: bi("SUV", "SUV"), sortOrder: 4 },
  })).id;

  {
    const modelId = "seed-model-ec-van";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"EC Van","en":"EC Van"}, slug: {"vi":"ec-van","en":"ec-van"}, tagline: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, description: {"vi":"EC Van Tiện dụng - sinh lời Hướng dẫn đặt cọc EC Van Link đặt cọc : Đặt cọc VinFast EC Van","en":"EC Van Tiện dụng - sinh lời Hướng dẫn đặt cọc EC Van Link đặt cọc : Đặt cọc VinFast EC Van"}, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: modelId, segmentId: segmentIds["van"], name: {"vi":"EC Van","en":"EC Van"}, slug: {"vi":"ec-van","en":"ec-van"}, tagline: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, description: {"vi":"EC Van Tiện dụng - sinh lời Hướng dẫn đặt cọc EC Van Link đặt cọc : Đặt cọc VinFast EC Van","en":"EC Van Tiện dụng - sinh lời Hướng dẫn đặt cọc EC Van Link đặt cọc : Đặt cọc VinFast EC Van"}, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-ec-van-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-ec-van-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-ec-van-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 268000000, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-ec-van-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 268000000, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-1" },
      update: { title: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, body: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, sortOrder: 1 },
      create: { id: "seed-feature-ec-van-1", modelId, title: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, body: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-2" },
      update: { title: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, body: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, sortOrder: 2 },
      create: { id: "seed-feature-ec-van-2", modelId, title: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, body: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-3" },
      update: { title: {"vi":"Link đặt cọc : Đặt cọc VinFast EC Van","en":"Link đặt cọc : Đặt cọc VinFast EC Van"}, body: {"vi":"Link đặt cọc : Đặt cọc VinFast EC Van","en":"Link đặt cọc : Đặt cọc VinFast EC Van"}, sortOrder: 3 },
      create: { id: "seed-feature-ec-van-3", modelId, title: {"vi":"Link đặt cọc : Đặt cọc VinFast EC Van","en":"Link đặt cọc : Đặt cọc VinFast EC Van"}, body: {"vi":"Link đặt cọc : Đặt cọc VinFast EC Van","en":"Link đặt cọc : Đặt cọc VinFast EC Van"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-4" },
      update: { title: {"vi":"VinFast EC Van Nâng cao Cửa Lùa","en":"VinFast EC Van Nâng cao Cửa Lùa"}, body: {"vi":"VinFast EC Van Nâng cao Cửa Lùa","en":"VinFast EC Van Nâng cao Cửa Lùa"}, sortOrder: 4 },
      create: { id: "seed-feature-ec-van-4", modelId, title: {"vi":"VinFast EC Van Nâng cao Cửa Lùa","en":"VinFast EC Van Nâng cao Cửa Lùa"}, body: {"vi":"VinFast EC Van Nâng cao Cửa Lùa","en":"VinFast EC Van Nâng cao Cửa Lùa"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-herio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Herio Green","en":"Herio Green"}, slug: {"vi":"herio-green","en":"herio-green"}, tagline: {"vi":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Đượ","en":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Đượ"}, description: {"vi":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh. Tối ưu không gian cho tài xế vận hành nhiều giờ mà vẫn thư thái. Ghế ngồi thiết kế mỏng giúp mở rộng không gian để chân. Màn hình giải trí trung tâm trực quan, thao tác nhanh chóng. Hệ thống lọc không khí PM2.5 giúp khoang lái luôn trong lành, mang lại trải nghiệm dễ chịu cho cả tài xế và hành khách. Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh.","en":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh. Tối ưu không gian cho tài xế vận hành nhiều giờ mà vẫn thư thái. Ghế ngồi thiết kế mỏng giúp mở rộng không gian để chân. Màn hình giải trí trung tâm trực quan, thao tác nhanh chóng. Hệ thống lọc không khí PM2.5 giúp khoang lái luôn trong lành, mang lại trải nghiệm dễ chịu cho cả tài xế và hành khách. Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh."}, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Herio Green","en":"Herio Green"}, slug: {"vi":"herio-green","en":"herio-green"}, tagline: {"vi":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Đượ","en":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Đượ"}, description: {"vi":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh. Tối ưu không gian cho tài xế vận hành nhiều giờ mà vẫn thư thái. Ghế ngồi thiết kế mỏng giúp mở rộng không gian để chân. Màn hình giải trí trung tâm trực quan, thao tác nhanh chóng. Hệ thống lọc không khí PM2.5 giúp khoang lái luôn trong lành, mang lại trải nghiệm dễ chịu cho cả tài xế và hành khách. Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh.","en":"Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh. Tối ưu không gian cho tài xế vận hành nhiều giờ mà vẫn thư thái. Ghế ngồi thiết kế mỏng giúp mở rộng không gian để chân. Màn hình giải trí trung tâm trực quan, thao tác nhanh chóng. Hệ thống lọc không khí PM2.5 giúp khoang lái luôn trong lành, mang lại trải nghiệm dễ chịu cho cả tài xế và hành khách. Herio Green sở hữu công suất động cơ mạnh nhất phân khúc, giúp tăng tốc nhanh, vận hành êm ái và linh hoạt trên phố. Được thiết kế gọn gàng nhưng đầy năng lượng, công suất và lực kéo vượt trội, trang bị túi khí nhiều nhất phân khúc, đảm bảo an toàn trên nhiều địa hình, Herio Green phù hợp cho cả nhu cầu di chuyển cá nhân và dịch vụ vận doanh."}, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-herio-green-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-herio-green-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-herio-green-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 469000000, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-herio-green-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 469000000, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-herio-green-1" },
      update: { title: {"vi":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong","en":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong","en":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong"}, sortOrder: 1 },
      create: { id: "seed-feature-herio-green-1", modelId, title: {"vi":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong","en":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong","en":"So sánh giữa xe VinFast Herio Green và xe động cơ đốt trong"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-herio-green-2" },
      update: { title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
      create: { id: "seed-feature-herio-green-2", modelId, title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-herio-green-3" },
      update: { title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
      create: { id: "seed-feature-herio-green-3", modelId, title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-herio-green-4" },
      update: { title: {"vi":"Xe quốc dân Vận hành linh hoạt","en":"Xe quốc dân Vận hành linh hoạt"}, body: {"vi":"Xe quốc dân Vận hành linh hoạt","en":"Xe quốc dân Vận hành linh hoạt"}, sortOrder: 4 },
      create: { id: "seed-feature-herio-green-4", modelId, title: {"vi":"Xe quốc dân Vận hành linh hoạt","en":"Xe quốc dân Vận hành linh hoạt"}, body: {"vi":"Xe quốc dân Vận hành linh hoạt","en":"Xe quốc dân Vận hành linh hoạt"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-limo-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Limo Green","en":"Limo Green"}, slug: {"vi":"limo-green","en":"limo-green"}, tagline: {"vi":"Limo Green mang đến trải nghiệm di chuyển vượt trội với khoang xe 7 chỗ rộng rãi, thiết kế tối ưu cho sự thoải mái, tiện","en":"Limo Green mang đến trải nghiệm di chuyển vượt trội với khoang xe 7 chỗ rộng rãi, thiết kế tối ưu cho sự thoải mái, tiện"}, description: {"vi":"VinFast Limo Green là mẫu MPV điện 7 chỗ hướng đến gia đình và khách hàng kinh doanh dịch vụ. Xe sở hữu không gian rộng rãi, thiết kế hiện đại và khả năng vận hành êm ái. Bên cạnh đó, chi phí sử dụng tiết kiệm cũng là một lợi thế nổi bật. Limo Green phù hợp cho nhu cầu di chuyển hằng ngày và những chuyến đi dài. VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7. So với các mẫu MPV điện cùng phân khúc, Limo Green cũng có lợi thế về không gian. Xe có kích thước nhỉnh hơn BYD M6 và tương đương Toyota Innova Cross. Nhờ đó, cả ba hàng ghế đều mang lại sự thoải mái cho hành khách.","en":"VinFast Limo Green là mẫu MPV điện 7 chỗ hướng đến gia đình và khách hàng kinh doanh dịch vụ. Xe sở hữu không gian rộng rãi, thiết kế hiện đại và khả năng vận hành êm ái. Bên cạnh đó, chi phí sử dụng tiết kiệm cũng là một lợi thế nổi bật. Limo Green phù hợp cho nhu cầu di chuyển hằng ngày và những chuyến đi dài. VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7. So với các mẫu MPV điện cùng phân khúc, Limo Green cũng có lợi thế về không gian. Xe có kích thước nhỉnh hơn BYD M6 và tương đương Toyota Innova Cross. Nhờ đó, cả ba hàng ghế đều mang lại sự thoải mái cho hành khách."}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 3 },
      create: { id: modelId, segmentId: segmentIds["mpv"], name: {"vi":"Limo Green","en":"Limo Green"}, slug: {"vi":"limo-green","en":"limo-green"}, tagline: {"vi":"Limo Green mang đến trải nghiệm di chuyển vượt trội với khoang xe 7 chỗ rộng rãi, thiết kế tối ưu cho sự thoải mái, tiện","en":"Limo Green mang đến trải nghiệm di chuyển vượt trội với khoang xe 7 chỗ rộng rãi, thiết kế tối ưu cho sự thoải mái, tiện"}, description: {"vi":"VinFast Limo Green là mẫu MPV điện 7 chỗ hướng đến gia đình và khách hàng kinh doanh dịch vụ. Xe sở hữu không gian rộng rãi, thiết kế hiện đại và khả năng vận hành êm ái. Bên cạnh đó, chi phí sử dụng tiết kiệm cũng là một lợi thế nổi bật. Limo Green phù hợp cho nhu cầu di chuyển hằng ngày và những chuyến đi dài. VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7. So với các mẫu MPV điện cùng phân khúc, Limo Green cũng có lợi thế về không gian. Xe có kích thước nhỉnh hơn BYD M6 và tương đương Toyota Innova Cross. Nhờ đó, cả ba hàng ghế đều mang lại sự thoải mái cho hành khách.","en":"VinFast Limo Green là mẫu MPV điện 7 chỗ hướng đến gia đình và khách hàng kinh doanh dịch vụ. Xe sở hữu không gian rộng rãi, thiết kế hiện đại và khả năng vận hành êm ái. Bên cạnh đó, chi phí sử dụng tiết kiệm cũng là một lợi thế nổi bật. Limo Green phù hợp cho nhu cầu di chuyển hằng ngày và những chuyến đi dài. VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7. So với các mẫu MPV điện cùng phân khúc, Limo Green cũng có lợi thế về không gian. Xe có kích thước nhỉnh hơn BYD M6 và tương đương Toyota Innova Cross. Nhờ đó, cả ba hàng ghế đều mang lại sự thoải mái cho hành khách."}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 3 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-limo-green-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-limo-green-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-limo-green-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 699000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-limo-green-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 699000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-1" },
      update: { title: {"vi":"Thiết kế rộng rãi, tối ưu không gian","en":"Thiết kế rộng rãi, tối ưu không gian"}, body: {"vi":"VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7.","en":"VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7."}, sortOrder: 1 },
      create: { id: "seed-feature-limo-green-1", modelId, title: {"vi":"Thiết kế rộng rãi, tối ưu không gian","en":"Thiết kế rộng rãi, tối ưu không gian"}, body: {"vi":"VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7.","en":"VinFast Limo Green có kích thước tổng thể 4.740 x 1.872 x 1.728 mm (Dài x Rộng x Cao). Kích thước này lớn hơn nhiều mẫu MPV cỡ nhỏ như Mitsubishi Xpander, Toyota Veloz và Suzuki XL7."}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-2" },
      update: { title: {"vi":"Động cơ điện mạnh mẽ, quãng đường lên đến 450 km","en":"Động cơ điện mạnh mẽ, quãng đường lên đến 450 km"}, body: {"vi":"VinFast Limo Green sử dụng hệ dẫn động cầu trước. Xe có ba chế độ lái gồm Eco, Comfort và Sport. Người lái có thể dễ dàng lựa chọn chế độ phù hợp với từng điều kiện vận hành.","en":"VinFast Limo Green sử dụng hệ dẫn động cầu trước. Xe có ba chế độ lái gồm Eco, Comfort và Sport. Người lái có thể dễ dàng lựa chọn chế độ phù hợp với từng điều kiện vận hành."}, sortOrder: 2 },
      create: { id: "seed-feature-limo-green-2", modelId, title: {"vi":"Động cơ điện mạnh mẽ, quãng đường lên đến 450 km","en":"Động cơ điện mạnh mẽ, quãng đường lên đến 450 km"}, body: {"vi":"VinFast Limo Green sử dụng hệ dẫn động cầu trước. Xe có ba chế độ lái gồm Eco, Comfort và Sport. Người lái có thể dễ dàng lựa chọn chế độ phù hợp với từng điều kiện vận hành.","en":"VinFast Limo Green sử dụng hệ dẫn động cầu trước. Xe có ba chế độ lái gồm Eco, Comfort và Sport. Người lái có thể dễ dàng lựa chọn chế độ phù hợp với từng điều kiện vận hành."}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-3" },
      update: { title: {"vi":"Hệ thống khung gầm vận hành ổn định","en":"Hệ thống khung gầm vận hành ổn định"}, body: {"vi":"VinFast Limo Green được trang bị mâm hợp kim 18 inch. Xe sử dụng phanh đĩa trên cả bốn bánh. Phía trước là đĩa thông gió, trong khi phía sau là đĩa tiêu chuẩn.","en":"VinFast Limo Green được trang bị mâm hợp kim 18 inch. Xe sử dụng phanh đĩa trên cả bốn bánh. Phía trước là đĩa thông gió, trong khi phía sau là đĩa tiêu chuẩn."}, sortOrder: 3 },
      create: { id: "seed-feature-limo-green-3", modelId, title: {"vi":"Hệ thống khung gầm vận hành ổn định","en":"Hệ thống khung gầm vận hành ổn định"}, body: {"vi":"VinFast Limo Green được trang bị mâm hợp kim 18 inch. Xe sử dụng phanh đĩa trên cả bốn bánh. Phía trước là đĩa thông gió, trong khi phía sau là đĩa tiêu chuẩn.","en":"VinFast Limo Green được trang bị mâm hợp kim 18 inch. Xe sử dụng phanh đĩa trên cả bốn bánh. Phía trước là đĩa thông gió, trong khi phía sau là đĩa tiêu chuẩn."}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-4" },
      update: { title: {"vi":"Hệ thống đèn LED hiện đại","en":"Hệ thống đèn LED hiện đại"}, body: {"vi":"Toàn bộ hệ thống chiếu sáng trên VinFast Limo Green đều sử dụng công nghệ LED. Xe được trang bị đèn pha, đèn hậu, đèn ban ngày và đèn phanh trên cao.","en":"Toàn bộ hệ thống chiếu sáng trên VinFast Limo Green đều sử dụng công nghệ LED. Xe được trang bị đèn pha, đèn hậu, đèn ban ngày và đèn phanh trên cao."}, sortOrder: 4 },
      create: { id: "seed-feature-limo-green-4", modelId, title: {"vi":"Hệ thống đèn LED hiện đại","en":"Hệ thống đèn LED hiện đại"}, body: {"vi":"Toàn bộ hệ thống chiếu sáng trên VinFast Limo Green đều sử dụng công nghệ LED. Xe được trang bị đèn pha, đèn hậu, đèn ban ngày và đèn phanh trên cao.","en":"Toàn bộ hệ thống chiếu sáng trên VinFast Limo Green đều sử dụng công nghệ LED. Xe được trang bị đèn pha, đèn hậu, đèn ban ngày và đèn phanh trên cao."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-minio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Minio Green","en":"Minio Green"}, slug: {"vi":"minio-green","en":"minio-green"}, tagline: {"vi":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGree","en":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGree"}, description: {"vi":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGreen hiện đại, phù hợp với nhiều phong cách từ sử dụng cá nhân đến kinh doanh dịch vụ. Minio Green có khoảng sáng gầm xe lý tưởng, giúp vượt chướng ngại vật dễ dàng. Cùng trải nghiệm “xe 4 bánh, tự do như 2” – Linh hoạt như xe máy, an toàn như xe hơi, phù hợp với mọi nhu cầu sử dụng. Khoang lái được tối ưu để mang lại sự thoải mái bất ngờ. Ghế ngồi êm ái, màn hình trực quan, vô lăng tích hợp nút bấm giúp thao tác dễ dàng. Đầy đủ tiện ích cần thiết để di chuyển nội thành thuận tiện và thoải mái. Giải pháp tối ưu cho di chuyển nội thị và di chuyển trong nội địa phương.","en":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGreen hiện đại, phù hợp với nhiều phong cách từ sử dụng cá nhân đến kinh doanh dịch vụ. Minio Green có khoảng sáng gầm xe lý tưởng, giúp vượt chướng ngại vật dễ dàng. Cùng trải nghiệm “xe 4 bánh, tự do như 2” – Linh hoạt như xe máy, an toàn như xe hơi, phù hợp với mọi nhu cầu sử dụng. Khoang lái được tối ưu để mang lại sự thoải mái bất ngờ. Ghế ngồi êm ái, màn hình trực quan, vô lăng tích hợp nút bấm giúp thao tác dễ dàng. Đầy đủ tiện ích cần thiết để di chuyển nội thành thuận tiện và thoải mái. Giải pháp tối ưu cho di chuyển nội thị và di chuyển trong nội địa phương."}, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 4 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Minio Green","en":"Minio Green"}, slug: {"vi":"minio-green","en":"minio-green"}, tagline: {"vi":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGree","en":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGree"}, description: {"vi":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGreen hiện đại, phù hợp với nhiều phong cách từ sử dụng cá nhân đến kinh doanh dịch vụ. Minio Green có khoảng sáng gầm xe lý tưởng, giúp vượt chướng ngại vật dễ dàng. Cùng trải nghiệm “xe 4 bánh, tự do như 2” – Linh hoạt như xe máy, an toàn như xe hơi, phù hợp với mọi nhu cầu sử dụng. Khoang lái được tối ưu để mang lại sự thoải mái bất ngờ. Ghế ngồi êm ái, màn hình trực quan, vô lăng tích hợp nút bấm giúp thao tác dễ dàng. Đầy đủ tiện ích cần thiết để di chuyển nội thành thuận tiện và thoải mái. Giải pháp tối ưu cho di chuyển nội thị và di chuyển trong nội địa phương.","en":"Minio Green tối ưu cho những con phố chật hẹp với thiết kế nhỏ gọn, dễ dàng di chuyển và đậu, đỗ xe. Kiểu dáng MinioGreen hiện đại, phù hợp với nhiều phong cách từ sử dụng cá nhân đến kinh doanh dịch vụ. Minio Green có khoảng sáng gầm xe lý tưởng, giúp vượt chướng ngại vật dễ dàng. Cùng trải nghiệm “xe 4 bánh, tự do như 2” – Linh hoạt như xe máy, an toàn như xe hơi, phù hợp với mọi nhu cầu sử dụng. Khoang lái được tối ưu để mang lại sự thoải mái bất ngờ. Ghế ngồi êm ái, màn hình trực quan, vô lăng tích hợp nút bấm giúp thao tác dễ dàng. Đầy đủ tiện ích cần thiết để di chuyển nội thành thuận tiện và thoải mái. Giải pháp tối ưu cho di chuyển nội thị và di chuyển trong nội địa phương."}, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 4 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-minio-green-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-minio-green-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-minio-green-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 269000000, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-minio-green-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 269000000, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-1" },
      update: { title: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, body: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, sortOrder: 1 },
      create: { id: "seed-feature-minio-green-1", modelId, title: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, body: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-2" },
      update: { title: {"vi":"Nhỏ gọn linh hoạt Ngôi sao đường phố","en":"Nhỏ gọn linh hoạt Ngôi sao đường phố"}, body: {"vi":"Nhỏ gọn linh hoạt Ngôi sao đường phố","en":"Nhỏ gọn linh hoạt Ngôi sao đường phố"}, sortOrder: 2 },
      create: { id: "seed-feature-minio-green-2", modelId, title: {"vi":"Nhỏ gọn linh hoạt Ngôi sao đường phố","en":"Nhỏ gọn linh hoạt Ngôi sao đường phố"}, body: {"vi":"Nhỏ gọn linh hoạt Ngôi sao đường phố","en":"Nhỏ gọn linh hoạt Ngôi sao đường phố"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-3" },
      update: { title: {"vi":"Tối giản nhưng không thiếu tiện nghi","en":"Tối giản nhưng không thiếu tiện nghi"}, body: {"vi":"Tối giản nhưng không thiếu tiện nghi","en":"Tối giản nhưng không thiếu tiện nghi"}, sortOrder: 3 },
      create: { id: "seed-feature-minio-green-3", modelId, title: {"vi":"Tối giản nhưng không thiếu tiện nghi","en":"Tối giản nhưng không thiếu tiện nghi"}, body: {"vi":"Tối giản nhưng không thiếu tiện nghi","en":"Tối giản nhưng không thiếu tiện nghi"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-4" },
      update: { title: {"vi":"Gọn nhẹ, tiết kiệm năng lượng","en":"Gọn nhẹ, tiết kiệm năng lượng"}, body: {"vi":"Gọn nhẹ, tiết kiệm năng lượng","en":"Gọn nhẹ, tiết kiệm năng lượng"}, sortOrder: 4 },
      create: { id: "seed-feature-minio-green-4", modelId, title: {"vi":"Gọn nhẹ, tiết kiệm năng lượng","en":"Gọn nhẹ, tiết kiệm năng lượng"}, body: {"vi":"Gọn nhẹ, tiết kiệm năng lượng","en":"Gọn nhẹ, tiết kiệm năng lượng"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-mpv-7";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF MPV 7","en":"VF MPV 7"}, slug: {"vi":"mpv-7","en":"mpv-7"}, tagline: {"vi":"Đăc biệt: Trong tháng 6 Tặng voucher VinPearl , có thể quy đổi sang tiền mặt (Trị giá 3% MSRP )","en":"Đăc biệt: Trong tháng 6 Tặng voucher VinPearl , có thể quy đổi sang tiền mặt (Trị giá 3% MSRP )"}, description: {"vi":"Dài x Rộng x Cao (mm)4740 x 1872 x 1734 Thời gian nạp pin nhanh nhất (phút)30 phút (10% - 70%) Hệ thống treo (trước/sau)MacPherson / Đa liên kết","en":"Dài x Rộng x Cao (mm)4740 x 1872 x 1734 Thời gian nạp pin nhanh nhất (phút)30 phút (10% - 70%) Hệ thống treo (trước/sau)MacPherson / Đa liên kết"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 5 },
      create: { id: modelId, segmentId: segmentIds["mpv"], name: {"vi":"VF MPV 7","en":"VF MPV 7"}, slug: {"vi":"mpv-7","en":"mpv-7"}, tagline: {"vi":"Đăc biệt: Trong tháng 6 Tặng voucher VinPearl , có thể quy đổi sang tiền mặt (Trị giá 3% MSRP )","en":"Đăc biệt: Trong tháng 6 Tặng voucher VinPearl , có thể quy đổi sang tiền mặt (Trị giá 3% MSRP )"}, description: {"vi":"Dài x Rộng x Cao (mm)4740 x 1872 x 1734 Thời gian nạp pin nhanh nhất (phút)30 phút (10% - 70%) Hệ thống treo (trước/sau)MacPherson / Đa liên kết","en":"Dài x Rộng x Cao (mm)4740 x 1872 x 1734 Thời gian nạp pin nhanh nhất (phút)30 phút (10% - 70%) Hệ thống treo (trước/sau)MacPherson / Đa liên kết"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 5 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-mpv-7-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-mpv-7-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-mpv-7-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 750000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-mpv-7-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 750000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-mpv-7-1" },
      update: { title: {"vi":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong"}, sortOrder: 1 },
      create: { id: "seed-feature-mpv-7-1", modelId, title: {"vi":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF MPV 7 và xe động cơ đốt trong"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-mpv-7-2" },
      update: { title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
      create: { id: "seed-feature-mpv-7-2", modelId, title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-mpv-7-3" },
      update: { title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
      create: { id: "seed-feature-mpv-7-3", modelId, title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
    });
  }
  {
    const modelId = "seed-model-nerio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Nerio Green","en":"Nerio Green"}, slug: {"vi":"nerio-green","en":"nerio-green"}, tagline: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong p","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong p"}, description: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành.","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành."}, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 6 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Nerio Green","en":"Nerio Green"}, slug: {"vi":"nerio-green","en":"nerio-green"}, tagline: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong p","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong p"}, description: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành.","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành. Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành."}, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 6 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-nerio-green-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-nerio-green-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-nerio-green-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 628000000, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-nerio-green-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 628000000, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-nerio-green-1" },
      update: { title: {"vi":"ĐĂNG KÝ NHẬN THÔNG TIN","en":"ĐĂNG KÝ NHẬN THÔNG TIN"}, body: {"vi":"ĐĂNG KÝ NHẬN THÔNG TIN","en":"ĐĂNG KÝ NHẬN THÔNG TIN"}, sortOrder: 1 },
      create: { id: "seed-feature-nerio-green-1", modelId, title: {"vi":"ĐĂNG KÝ NHẬN THÔNG TIN","en":"ĐĂNG KÝ NHẬN THÔNG TIN"}, body: {"vi":"ĐĂNG KÝ NHẬN THÔNG TIN","en":"ĐĂNG KÝ NHẬN THÔNG TIN"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-nerio-green-2" },
      update: { title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
      create: { id: "seed-feature-nerio-green-2", modelId, title: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, body: {"vi":"Trung tâm tùy chọn Cookies","en":"Trung tâm tùy chọn Cookies"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-nerio-green-3" },
      update: { title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
      create: { id: "seed-feature-nerio-green-3", modelId, title: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, body: {"vi":"Quyền riêng tư của bạn","en":"Quyền riêng tư của bạn"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-nerio-green-4" },
      update: { title: {"vi":"Bền bỉ, linh hoạt Tối ưu cho mọi hành trình","en":"Bền bỉ, linh hoạt Tối ưu cho mọi hành trình"}, body: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành.","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành."}, sortOrder: 4 },
      create: { id: "seed-feature-nerio-green-4", modelId, title: {"vi":"Bền bỉ, linh hoạt Tối ưu cho mọi hành trình","en":"Bền bỉ, linh hoạt Tối ưu cho mọi hành trình"}, body: {"vi":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành.","en":"Nerio Green – sản phẩm kết hợp công suất mạnh mẽ với khả năng vận hành ổn định trên nhiều địa hình. Xe linh hoạt trong phố, vững vàng trên đường trường. Với hệ thống pin tối ưu giúp quãng đường di chuyển dài hơn, tiết kiệm chi phí vận hành."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-3";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 3","en":"VF 3"}, slug: {"vi":"vf-3","en":"vf-3"}, tagline: {"vi":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chu","en":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chu"}, description: {"vi":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chuyển xanh toàn cầu, trải nghiệm giá trị trên mỗi hành trình, và tự do thể hiện phong cách sống. Với dải màu ngoại thất đa dạng và độc đáo, bao gồm 9 tùy chọn màu sắc trẻ trung và thời thượng, VF 3 là sự lựa chọn hoàn hảo giúp bạn thoả sức thể hiện sự khác biệt và cá tính của riêng mình. Dù bạn là ai, hãy lựa chọn màu sắc và trang bị VF 3 theo sở thích của bạn, và cùng VinFast biến ước mơ của bạn thành hiện thực. VinFast VF 3 là mẫu xe hiếm hoi trong phân khúc xe sở hữu la-zăng kích thước 16 inch, không chỉ tạo điểm nhấn về thiết kế mà còn góp phần gia tăng khả năng di chuyển trên địa hình đa dạng trong đô thị. Đặc biệt, VF 3 được trang bị tuỳ chọn ốp la-zăng, tăng thêm vẻ cá tính, sự sang trọng cho chiếc xe.","en":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chuyển xanh toàn cầu, trải nghiệm giá trị trên mỗi hành trình, và tự do thể hiện phong cách sống. Với dải màu ngoại thất đa dạng và độc đáo, bao gồm 9 tùy chọn màu sắc trẻ trung và thời thượng, VF 3 là sự lựa chọn hoàn hảo giúp bạn thoả sức thể hiện sự khác biệt và cá tính của riêng mình. Dù bạn là ai, hãy lựa chọn màu sắc và trang bị VF 3 theo sở thích của bạn, và cùng VinFast biến ước mơ của bạn thành hiện thực. VinFast VF 3 là mẫu xe hiếm hoi trong phân khúc xe sở hữu la-zăng kích thước 16 inch, không chỉ tạo điểm nhấn về thiết kế mà còn góp phần gia tăng khả năng di chuyển trên địa hình đa dạng trong đô thị. Đặc biệt, VF 3 được trang bị tuỳ chọn ốp la-zăng, tăng thêm vẻ cá tính, sự sang trọng cho chiếc xe."}, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 7 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 3","en":"VF 3"}, slug: {"vi":"vf-3","en":"vf-3"}, tagline: {"vi":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chu","en":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chu"}, description: {"vi":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chuyển xanh toàn cầu, trải nghiệm giá trị trên mỗi hành trình, và tự do thể hiện phong cách sống. Với dải màu ngoại thất đa dạng và độc đáo, bao gồm 9 tùy chọn màu sắc trẻ trung và thời thượng, VF 3 là sự lựa chọn hoàn hảo giúp bạn thoả sức thể hiện sự khác biệt và cá tính của riêng mình. Dù bạn là ai, hãy lựa chọn màu sắc và trang bị VF 3 theo sở thích của bạn, và cùng VinFast biến ước mơ của bạn thành hiện thực. VinFast VF 3 là mẫu xe hiếm hoi trong phân khúc xe sở hữu la-zăng kích thước 16 inch, không chỉ tạo điểm nhấn về thiết kế mà còn góp phần gia tăng khả năng di chuyển trên địa hình đa dạng trong đô thị. Đặc biệt, VF 3 được trang bị tuỳ chọn ốp la-zăng, tăng thêm vẻ cá tính, sự sang trọng cho chiếc xe.","en":"Với thiết kế tối giản, nhỏ gọn, cá tính và năng động, VinFast VF 3 sẽ luôn cùng bạn hoà nhịp với xu thế công nghệ di chuyển xanh toàn cầu, trải nghiệm giá trị trên mỗi hành trình, và tự do thể hiện phong cách sống. Với dải màu ngoại thất đa dạng và độc đáo, bao gồm 9 tùy chọn màu sắc trẻ trung và thời thượng, VF 3 là sự lựa chọn hoàn hảo giúp bạn thoả sức thể hiện sự khác biệt và cá tính của riêng mình. Dù bạn là ai, hãy lựa chọn màu sắc và trang bị VF 3 theo sở thích của bạn, và cùng VinFast biến ước mơ của bạn thành hiện thực. VinFast VF 3 là mẫu xe hiếm hoi trong phân khúc xe sở hữu la-zăng kích thước 16 inch, không chỉ tạo điểm nhấn về thiết kế mà còn góp phần gia tăng khả năng di chuyển trên địa hình đa dạng trong đô thị. Đặc biệt, VF 3 được trang bị tuỳ chọn ốp la-zăng, tăng thêm vẻ cá tính, sự sang trọng cho chiếc xe."}, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 7 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-3-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-3-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-3-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 278000000, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-3-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 278000000, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-3-1" },
      update: { title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
      create: { id: "seed-feature-vf-3-1", modelId, title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-3-2" },
      update: { title: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, body: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, sortOrder: 2 },
      create: { id: "seed-feature-vf-3-2", modelId, title: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, body: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-3-3" },
      update: { title: {"vi":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!","en":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!"}, body: {"vi":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!","en":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-3-3", modelId, title: {"vi":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!","en":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!"}, body: {"vi":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!","en":"VinFast VF 3 - Tự do sáng tạo, toả sáng chất riêng!"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-3-4" },
      update: { title: {"vi":"La-zăng vượt trội về kích thước & phong cách.","en":"La-zăng vượt trội về kích thước & phong cách."}, body: {"vi":"La-zăng vượt trội về kích thước & phong cách.","en":"La-zăng vượt trội về kích thước & phong cách."}, sortOrder: 4 },
      create: { id: "seed-feature-vf-3-4", modelId, title: {"vi":"La-zăng vượt trội về kích thước & phong cách.","en":"La-zăng vượt trội về kích thước & phong cách."}, body: {"vi":"La-zăng vượt trội về kích thước & phong cách.","en":"La-zăng vượt trội về kích thước & phong cách."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-5";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 5","en":"VF 5"}, slug: {"vi":"vf-5","en":"vf-5"}, tagline: {"vi":"Chọn khai mở cung đường mới thay vì lối mòn rập khuôn, năng lượng từ Summer Yellow giúp Kaity tự tin vào chất trẻ trung ","en":"Chọn khai mở cung đường mới thay vì lối mòn rập khuôn, năng lượng từ Summer Yellow giúp Kaity tự tin vào chất trẻ trung "}, description: {"vi":"Thời gian nạp pin nhanh nhất (10%-70%) VF 5 sở hữu thiết kế hiện đại, trẻ trung, cá tính và nổi bật với các lựa chọn phối màu nội ngoại thất, đảm bảo cá nhân hóa theo phong cách sống, cá tính và sở thích của mỗi khách hàng VinFast VF 5 Plus được trang bị đầy đủ những công nghệ tiên tiến bậc nhất:","en":"Thời gian nạp pin nhanh nhất (10%-70%) VF 5 sở hữu thiết kế hiện đại, trẻ trung, cá tính và nổi bật với các lựa chọn phối màu nội ngoại thất, đảm bảo cá nhân hóa theo phong cách sống, cá tính và sở thích của mỗi khách hàng VinFast VF 5 Plus được trang bị đầy đủ những công nghệ tiên tiến bậc nhất:"}, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 8 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 5","en":"VF 5"}, slug: {"vi":"vf-5","en":"vf-5"}, tagline: {"vi":"Chọn khai mở cung đường mới thay vì lối mòn rập khuôn, năng lượng từ Summer Yellow giúp Kaity tự tin vào chất trẻ trung ","en":"Chọn khai mở cung đường mới thay vì lối mòn rập khuôn, năng lượng từ Summer Yellow giúp Kaity tự tin vào chất trẻ trung "}, description: {"vi":"Thời gian nạp pin nhanh nhất (10%-70%) VF 5 sở hữu thiết kế hiện đại, trẻ trung, cá tính và nổi bật với các lựa chọn phối màu nội ngoại thất, đảm bảo cá nhân hóa theo phong cách sống, cá tính và sở thích của mỗi khách hàng VinFast VF 5 Plus được trang bị đầy đủ những công nghệ tiên tiến bậc nhất:","en":"Thời gian nạp pin nhanh nhất (10%-70%) VF 5 sở hữu thiết kế hiện đại, trẻ trung, cá tính và nổi bật với các lựa chọn phối màu nội ngoại thất, đảm bảo cá nhân hóa theo phong cách sống, cá tính và sở thích của mỗi khách hàng VinFast VF 5 Plus được trang bị đầy đủ những công nghệ tiên tiến bậc nhất:"}, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 8 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-5-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-5-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-5-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 496000000, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-5-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 496000000, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-1" },
      update: { title: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, body: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-5-1", modelId, title: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, body: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-2" },
      update: { title: {"vi":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng.","en":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng."}, body: {"vi":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng.","en":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng."}, sortOrder: 2 },
      create: { id: "seed-feature-vf-5-2", modelId, title: {"vi":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng.","en":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng."}, body: {"vi":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng.","en":"Với thiết kế hiện đại, độc đáo, được trang bị các công nghệ và tính năng thông minh vượt trội, khả năng vận hành mạnh mẽ, an toàn, VF 5 Plus hội tụ đầy đủ các yếu tố người dùng trẻ tìm kiếm cho một chiếc xe điện đô thị lý tưởng."}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-3" },
      update: { title: {"vi":"VF 5 Plus - Lái xanh, sống sành","en":"VF 5 Plus - Lái xanh, sống sành"}, body: {"vi":"VF 5 Plus - Lái xanh, sống sành","en":"VF 5 Plus - Lái xanh, sống sành"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-5-3", modelId, title: {"vi":"VF 5 Plus - Lái xanh, sống sành","en":"VF 5 Plus - Lái xanh, sống sành"}, body: {"vi":"VF 5 Plus - Lái xanh, sống sành","en":"VF 5 Plus - Lái xanh, sống sành"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-4" },
      update: { title: {"vi":"VinFast VF 5 Summer Yellow – Nổi bật và tràn đầy năng lượng","en":"VinFast VF 5 Summer Yellow – Nổi bật và tràn đầy năng lượng"}, body: {"vi":"Summer Yellow mang đến nguồn năng lượng tích cực và tinh thần chinh phục. Gam vàng nổi bật giúp VinFast VF 5 thu hút mọi ánh nhìn trên đường phố.","en":"Summer Yellow mang đến nguồn năng lượng tích cực và tinh thần chinh phục. Gam vàng nổi bật giúp VinFast VF 5 thu hút mọi ánh nhìn trên đường phố."}, sortOrder: 4 },
      create: { id: "seed-feature-vf-5-4", modelId, title: {"vi":"VinFast VF 5 Summer Yellow – Nổi bật và tràn đầy năng lượng","en":"VinFast VF 5 Summer Yellow – Nổi bật và tràn đầy năng lượng"}, body: {"vi":"Summer Yellow mang đến nguồn năng lượng tích cực và tinh thần chinh phục. Gam vàng nổi bật giúp VinFast VF 5 thu hút mọi ánh nhìn trên đường phố.","en":"Summer Yellow mang đến nguồn năng lượng tích cực và tinh thần chinh phục. Gam vàng nổi bật giúp VinFast VF 5 thu hút mọi ánh nhìn trên đường phố."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-6";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 6","en":"VF 6"}, slug: {"vi":"vf-6","en":"vf-6"}, tagline: {"vi":"Vui lòng gọi số Hotline 09.012.7777.3 để nhận ưu đãi và báo giá:","en":"Vui lòng gọi số Hotline 09.012.7777.3 để nhận ưu đãi và báo giá:"}, description: {"vi":"480 km/lần sạcDung lượng pinVF 6 Eco 150kW/201 hpCông suất tối đaVF 6 Plus VinFast VF6 là tuyệt tác nghệ thuật được thiết kế dựa trên triết lý “Cặp đối lập tự nhiên”, tạo nên sự cân bằng hoàn hảo giữa các yếu tố tưởng chừng như đối lập: thú vị – tinh tế, công nghệ – con người.","en":"480 km/lần sạcDung lượng pinVF 6 Eco 150kW/201 hpCông suất tối đaVF 6 Plus VinFast VF6 là tuyệt tác nghệ thuật được thiết kế dựa trên triết lý “Cặp đối lập tự nhiên”, tạo nên sự cân bằng hoàn hảo giữa các yếu tố tưởng chừng như đối lập: thú vị – tinh tế, công nghệ – con người."}, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 9 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 6","en":"VF 6"}, slug: {"vi":"vf-6","en":"vf-6"}, tagline: {"vi":"Vui lòng gọi số Hotline 09.012.7777.3 để nhận ưu đãi và báo giá:","en":"Vui lòng gọi số Hotline 09.012.7777.3 để nhận ưu đãi và báo giá:"}, description: {"vi":"480 km/lần sạcDung lượng pinVF 6 Eco 150kW/201 hpCông suất tối đaVF 6 Plus VinFast VF6 là tuyệt tác nghệ thuật được thiết kế dựa trên triết lý “Cặp đối lập tự nhiên”, tạo nên sự cân bằng hoàn hảo giữa các yếu tố tưởng chừng như đối lập: thú vị – tinh tế, công nghệ – con người.","en":"480 km/lần sạcDung lượng pinVF 6 Eco 150kW/201 hpCông suất tối đaVF 6 Plus VinFast VF6 là tuyệt tác nghệ thuật được thiết kế dựa trên triết lý “Cặp đối lập tự nhiên”, tạo nên sự cân bằng hoàn hảo giữa các yếu tố tưởng chừng như đối lập: thú vị – tinh tế, công nghệ – con người."}, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 9 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-6-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-6-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-6-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 646000000, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-6-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 646000000, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-6-1" },
      update: { title: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, body: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-6-1", modelId, title: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, body: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-6-2" },
      update: { title: {"vi":"Ngoại thất","en":"Ngoại thất"}, body: {"vi":"Thiết kế ngoại thất được khởi tạo từ những đường nét tinh tế đến từng chi tiết cùng vẻ ngoài năng động, ấn tượng ngay từ ánh nhìn đầu tiên","en":"Thiết kế ngoại thất được khởi tạo từ những đường nét tinh tế đến từng chi tiết cùng vẻ ngoài năng động, ấn tượng ngay từ ánh nhìn đầu tiên"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-6-2", modelId, title: {"vi":"Ngoại thất","en":"Ngoại thất"}, body: {"vi":"Thiết kế ngoại thất được khởi tạo từ những đường nét tinh tế đến từng chi tiết cùng vẻ ngoài năng động, ấn tượng ngay từ ánh nhìn đầu tiên","en":"Thiết kế ngoại thất được khởi tạo từ những đường nét tinh tế đến từng chi tiết cùng vẻ ngoài năng động, ấn tượng ngay từ ánh nhìn đầu tiên"}, sortOrder: 2 },
    });
  }
  {
    const modelId = "seed-model-vf-7";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 7","en":"VF 7"}, slug: {"vi":"vf-7","en":"vf-7"}, tagline: {"vi":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có th","en":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có th"}, description: {"vi":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có thể thay đổi mà không cần báo trước. Lấy cảm hứng từ vũ trụ và các vật thể bay trong không gian, VF 7 hiện thân cho sự tự do, công nghệ, thời đại, cá tính, mạnh mẽ và thể thao, thoả mãn mọi tâm hồn đam mê thẩm mỹ và tốc độ. Những đường nét và hình khối được sử dụng nhịp nhàng và tinh tế, mang đến cho chủ nhân VF 7 không gian trải nghiệm đầy phóng khoáng và tràn đầy năng lượng; song vẫn không làm mất đi sự tối giản, tinh khiết và thời trang vốn có của mẫu xe đánh thức mọi đam mê.","en":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có thể thay đổi mà không cần báo trước. Lấy cảm hứng từ vũ trụ và các vật thể bay trong không gian, VF 7 hiện thân cho sự tự do, công nghệ, thời đại, cá tính, mạnh mẽ và thể thao, thoả mãn mọi tâm hồn đam mê thẩm mỹ và tốc độ. Những đường nét và hình khối được sử dụng nhịp nhàng và tinh tế, mang đến cho chủ nhân VF 7 không gian trải nghiệm đầy phóng khoáng và tràn đầy năng lượng; song vẫn không làm mất đi sự tối giản, tinh khiết và thời trang vốn có của mẫu xe đánh thức mọi đam mê."}, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 10 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 7","en":"VF 7"}, slug: {"vi":"vf-7","en":"vf-7"}, tagline: {"vi":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có th","en":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có th"}, description: {"vi":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có thể thay đổi mà không cần báo trước. Lấy cảm hứng từ vũ trụ và các vật thể bay trong không gian, VF 7 hiện thân cho sự tự do, công nghệ, thời đại, cá tính, mạnh mẽ và thể thao, thoả mãn mọi tâm hồn đam mê thẩm mỹ và tốc độ. Những đường nét và hình khối được sử dụng nhịp nhàng và tinh tế, mang đến cho chủ nhân VF 7 không gian trải nghiệm đầy phóng khoáng và tràn đầy năng lượng; song vẫn không làm mất đi sự tối giản, tinh khiết và thời trang vốn có của mẫu xe đánh thức mọi đam mê.","en":"*Hình ảnh mang tính minh họa, sử dụng hình ảnh của sản phẩm trong giai đoạn tiền thương mại.Các thông tin sản phẩm có thể thay đổi mà không cần báo trước. Lấy cảm hứng từ vũ trụ và các vật thể bay trong không gian, VF 7 hiện thân cho sự tự do, công nghệ, thời đại, cá tính, mạnh mẽ và thể thao, thoả mãn mọi tâm hồn đam mê thẩm mỹ và tốc độ. Những đường nét và hình khối được sử dụng nhịp nhàng và tinh tế, mang đến cho chủ nhân VF 7 không gian trải nghiệm đầy phóng khoáng và tràn đầy năng lượng; song vẫn không làm mất đi sự tối giản, tinh khiết và thời trang vốn có của mẫu xe đánh thức mọi đam mê."}, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 10 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-7-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-7-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-7-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 740000000, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-7-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 740000000, attributes: [{"key":"range","value":498,"unit":"km"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-1" },
      update: { title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
      create: { id: "seed-feature-vf-7-1", modelId, title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-2" },
      update: { title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast."}, sortOrder: 2 },
      create: { id: "seed-feature-vf-7-2", modelId, title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế xe ô tô của VinFast."}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-3" },
      update: { title: {"vi":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô."}, body: {"vi":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô."}, sortOrder: 3 },
      create: { id: "seed-feature-vf-7-3", modelId, title: {"vi":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô."}, body: {"vi":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới từ hơn trăm năm lịch sử của ngành ô tô."}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-4" },
      update: { title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast."}, sortOrder: 4 },
      create: { id: "seed-feature-vf-7-4", modelId, title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kếxe ô tô của VinFast."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-8";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 8","en":"VF 8"}, slug: {"vi":"vf-8","en":"vf-8"}, tagline: {"vi":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt","en":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt"}, description: {"vi":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt và dịch vụ tận tâm. Quãng đường di chuyển 1 lần sạc đầy (CATL) Tỉ lệ thiết kế hiện đại định hình bởi triết lý “Cân bằng động”. Những khối cong mềm mại chấm phá bởi các đường cắt sắc nét tạo nên ấn tượng mạnh mẽ, mang đầy hơi thở của tương lai.","en":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt và dịch vụ tận tâm. Quãng đường di chuyển 1 lần sạc đầy (CATL) Tỉ lệ thiết kế hiện đại định hình bởi triết lý “Cân bằng động”. Những khối cong mềm mại chấm phá bởi các đường cắt sắc nét tạo nên ấn tượng mạnh mẽ, mang đầy hơi thở của tương lai."}, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 11 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 8","en":"VF 8"}, slug: {"vi":"vf-8","en":"vf-8"}, tagline: {"vi":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt","en":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt"}, description: {"vi":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt và dịch vụ tận tâm. Quãng đường di chuyển 1 lần sạc đầy (CATL) Tỉ lệ thiết kế hiện đại định hình bởi triết lý “Cân bằng động”. Những khối cong mềm mại chấm phá bởi các đường cắt sắc nét tạo nên ấn tượng mạnh mẽ, mang đầy hơi thở của tương lai.","en":"VF 8 đạt đến sự kết hợp hoàn hoàn hảo giữa chất lượng và giá trị thông qua công nghệ cao cấp, kỹ thuật sản xuất đặc biệt và dịch vụ tận tâm. Quãng đường di chuyển 1 lần sạc đầy (CATL) Tỉ lệ thiết kế hiện đại định hình bởi triết lý “Cân bằng động”. Những khối cong mềm mại chấm phá bởi các đường cắt sắc nét tạo nên ấn tượng mạnh mẽ, mang đầy hơi thở của tương lai."}, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 11 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-8-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-8-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-8-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 898000000, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-8-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 898000000, attributes: [{"key":"range","value":562,"unit":"km"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-1" },
      update: { title: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, body: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-8-1", modelId, title: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, body: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-2" },
      update: { title: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, body: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-8-2", modelId, title: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, body: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-3" },
      update: { title: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, body: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-8-3", modelId, title: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, body: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-4" },
      update: { title: {"vi":"Trải nghiệm thị giác không giới hạn","en":"Trải nghiệm thị giác không giới hạn"}, body: {"vi":"Trải nghiệm thị giác không giới hạn","en":"Trải nghiệm thị giác không giới hạn"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-8-4", modelId, title: {"vi":"Trải nghiệm thị giác không giới hạn","en":"Trải nghiệm thị giác không giới hạn"}, body: {"vi":"Trải nghiệm thị giác không giới hạn","en":"Trải nghiệm thị giác không giới hạn"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-9";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 9","en":"VF 9"}, slug: {"vi":"vf-9","en":"vf-9"}, tagline: {"vi":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng ch","en":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng ch"}, description: {"vi":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng chi tiết, VF 9mang đến trải nghiệm đặc biệt cao cấp cho người sở hữu. Vóc dáng bề thế của một chiếc SUV cỡ lớn cùng thiết kế giúp tối ưu tính khí động học để gia tăng quãng đường đi được, đem lại những trải nghiệm đẳng cấp. Thiết kế tối giản mang hơi hướng tương lai nhưng không kém phần tinh tế từ studio danh tiếng Pininfarina đem lại trải nghiệm ấn tượng và cuốn hút từ cái nhìn đầu tiên.","en":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng chi tiết, VF 9mang đến trải nghiệm đặc biệt cao cấp cho người sở hữu. Vóc dáng bề thế của một chiếc SUV cỡ lớn cùng thiết kế giúp tối ưu tính khí động học để gia tăng quãng đường đi được, đem lại những trải nghiệm đẳng cấp. Thiết kế tối giản mang hơi hướng tương lai nhưng không kém phần tinh tế từ studio danh tiếng Pininfarina đem lại trải nghiệm ấn tượng và cuốn hút từ cái nhìn đầu tiên."}, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 12 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 9","en":"VF 9"}, slug: {"vi":"vf-9","en":"vf-9"}, tagline: {"vi":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng ch","en":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng ch"}, description: {"vi":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng chi tiết, VF 9mang đến trải nghiệm đặc biệt cao cấp cho người sở hữu. Vóc dáng bề thế của một chiếc SUV cỡ lớn cùng thiết kế giúp tối ưu tính khí động học để gia tăng quãng đường đi được, đem lại những trải nghiệm đẳng cấp. Thiết kế tối giản mang hơi hướng tương lai nhưng không kém phần tinh tế từ studio danh tiếng Pininfarina đem lại trải nghiệm ấn tượng và cuốn hút từ cái nhìn đầu tiên.","en":"VF 9 là mẫu xe SUV 7 chỗ hàng đầu của VinFast. Với kiểu dáng tinh tế, công nghệ tiên tiến nhất và sự tỉ mỉ trong từng chi tiết, VF 9mang đến trải nghiệm đặc biệt cao cấp cho người sở hữu. Vóc dáng bề thế của một chiếc SUV cỡ lớn cùng thiết kế giúp tối ưu tính khí động học để gia tăng quãng đường đi được, đem lại những trải nghiệm đẳng cấp. Thiết kế tối giản mang hơi hướng tương lai nhưng không kém phần tinh tế từ studio danh tiếng Pininfarina đem lại trải nghiệm ấn tượng và cuốn hút từ cái nhìn đầu tiên."}, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 12 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-9-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-9-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-9-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 1348000000, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-9-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 1348000000, attributes: [{"key":"range","value":30,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-9-1" },
      update: { title: {"vi":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-9-1", modelId, title: {"vi":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong"}, body: {"vi":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong","en":"So sánh giữa xe VinFast VF 9 và xe động cơ đốt trong"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-9-2" },
      update: { title: {"vi":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9","en":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9"}, body: {"vi":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9","en":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-9-2", modelId, title: {"vi":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9","en":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9"}, body: {"vi":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9","en":"TỶ LỆ MUA LẠI CHO Khách hàng VF 9"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-9-3" },
      update: { title: {"vi":"Nhận báo giá & ưu đãi mới nhất","en":"Nhận báo giá & ưu đãi mới nhất"}, body: {"vi":"Nhận báo giá & ưu đãi mới nhất","en":"Nhận báo giá & ưu đãi mới nhất"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-9-3", modelId, title: {"vi":"Nhận báo giá & ưu đãi mới nhất","en":"Nhận báo giá & ưu đãi mới nhất"}, body: {"vi":"Nhận báo giá & ưu đãi mới nhất","en":"Nhận báo giá & ưu đãi mới nhất"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-9-4" },
      update: { title: {"vi":"Hơn cả sự tận hưởng","en":"Hơn cả sự tận hưởng"}, body: {"vi":"Hơn cả sự tận hưởng","en":"Hơn cả sự tận hưởng"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-9-4", modelId, title: {"vi":"Hơn cả sự tận hưởng","en":"Hơn cả sự tận hưởng"}, body: {"vi":"Hơn cả sự tận hưởng","en":"Hơn cả sự tận hưởng"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-e34";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF e34","en":"VF e34"}, slug: {"vi":"vf-e34","en":"vf-e34"}, tagline: {"vi":"VinFast ra mắt VF e34, mẫu C-SUV với thiết kế tinh tế, thân thiện với người dùng cùng loạt công nghệ thông minh hiện đại","en":"VinFast ra mắt VF e34, mẫu C-SUV với thiết kế tinh tế, thân thiện với người dùng cùng loạt công nghệ thông minh hiện đại"}, description: {"vi":"Cùng bạn bứt phá mọi giới hạn Mẫu C-SUV với thiết kế tinh tế Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Cùng bạn bứt phá mọi giới hạn Mẫu C-SUV với thiết kế tinh tế Ngoại thất hiện đại thu hút mọi ánh nhìn"}, attributes: [], published: true, sortOrder: 13 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF e34","en":"VF e34"}, slug: {"vi":"vf-e34","en":"vf-e34"}, tagline: {"vi":"VinFast ra mắt VF e34, mẫu C-SUV với thiết kế tinh tế, thân thiện với người dùng cùng loạt công nghệ thông minh hiện đại","en":"VinFast ra mắt VF e34, mẫu C-SUV với thiết kế tinh tế, thân thiện với người dùng cùng loạt công nghệ thông minh hiện đại"}, description: {"vi":"Cùng bạn bứt phá mọi giới hạn Mẫu C-SUV với thiết kế tinh tế Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Cùng bạn bứt phá mọi giới hạn Mẫu C-SUV với thiết kế tinh tế Ngoại thất hiện đại thu hút mọi ánh nhìn"}, attributes: [], published: true, sortOrder: 13 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-e34-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-e34-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [], published: true, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-1" },
      update: { title: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, body: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-e34-1", modelId, title: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, body: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-2" },
      update: { title: {"vi":"Mẫu C-SUV với thiết kế tinh tế","en":"Mẫu C-SUV với thiết kế tinh tế"}, body: {"vi":"Mẫu C-SUV với thiết kế tinh tế","en":"Mẫu C-SUV với thiết kế tinh tế"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-e34-2", modelId, title: {"vi":"Mẫu C-SUV với thiết kế tinh tế","en":"Mẫu C-SUV với thiết kế tinh tế"}, body: {"vi":"Mẫu C-SUV với thiết kế tinh tế","en":"Mẫu C-SUV với thiết kế tinh tế"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-3" },
      update: { title: {"vi":"Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Ngoại thất hiện đại thu hút mọi ánh nhìn"}, body: {"vi":"Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Ngoại thất hiện đại thu hút mọi ánh nhìn"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-e34-3", modelId, title: {"vi":"Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Ngoại thất hiện đại thu hút mọi ánh nhìn"}, body: {"vi":"Ngoại thất hiện đại thu hút mọi ánh nhìn","en":"Ngoại thất hiện đại thu hút mọi ánh nhìn"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-4" },
      update: { title: {"vi":"Nội thất rộng rãi, tiện nghi và hiện đại","en":"Nội thất rộng rãi, tiện nghi và hiện đại"}, body: {"vi":"Nội thất rộng rãi, tiện nghi và hiện đại","en":"Nội thất rộng rãi, tiện nghi và hiện đại"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-e34-4", modelId, title: {"vi":"Nội thất rộng rãi, tiện nghi và hiện đại","en":"Nội thất rộng rãi, tiện nghi và hiện đại"}, body: {"vi":"Nội thất rộng rãi, tiện nghi và hiện đại","en":"Nội thất rộng rãi, tiện nghi và hiện đại"}, sortOrder: 4 },
    });
  }

  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-1" },
    update: { title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 1, published: true },
    create: { id: "seed-hero-1", title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 1, published: true },
  });
  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-2" },
    update: { title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 2, published: true },
    create: { id: "seed-hero-2", title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 2, published: true },
  });
  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-3" },
    update: { title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 3, published: true },
    create: { id: "seed-hero-3", title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 3, published: true },
  });
  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-4" },
    update: { title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 4, published: true },
    create: { id: "seed-hero-4", title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 4, published: true },
  });
  await prisma.heroSlide.upsert({
    where: { id: "seed-hero-5" },
    update: { title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 5, published: true },
    create: { id: "seed-hero-5", title: {"vi":"Khuyến mãi","en":"Promotion"}, subtitle: {"vi":"Ưu đãi đặc biệt","en":"Special offer"}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: 5, published: true },
  });

  await prisma.newsPost.upsert({
    where: { id: "seed-news-1" },
    update: { slug: {"vi":"home","en":"home"}, title: {"vi":"Home","en":"Home"}, excerpt: {"vi":"Home","en":"Home"}, body: {"vi":"Home","en":"Home"}, published: true, featured: true, publishedAt: new Date() },
    create: { id: "seed-news-1", slug: {"vi":"home","en":"home"}, title: {"vi":"Home","en":"Home"}, excerpt: {"vi":"Home","en":"Home"}, body: {"vi":"Home","en":"Home"}, published: true, featured: true, publishedAt: new Date() },
  });
  await prisma.newsPost.upsert({
    where: { id: "seed-news-2" },
    update: { slug: {"vi":"ban-giao-vinfast-limo-green-trao-niem-tin-ong-hanh-xanh","en":"ban-giao-vinfast-limo-green-trao-niem-tin-ong-hanh-xanh"}, title: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, excerpt: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, body: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, published: true, featured: false, publishedAt: new Date() },
    create: { id: "seed-news-2", slug: {"vi":"ban-giao-vinfast-limo-green-trao-niem-tin-ong-hanh-xanh","en":"ban-giao-vinfast-limo-green-trao-niem-tin-ong-hanh-xanh"}, title: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, excerpt: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, body: {"vi":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh","en":"Bàn Giao VinFast Limo Green – Trao Niềm Tin, Đồng Hành Xanh"}, published: true, featured: false, publishedAt: new Date() },
  });
  await prisma.newsPost.upsert({
    where: { id: "seed-news-3" },
    update: { slug: {"vi":"vinfast-vf-3-lai-thu-tai-ngai-giao-cung-vinfast-ong-sai-gon","en":"vinfast-vf-3-lai-thu-tai-ngai-giao-cung-vinfast-ong-sai-gon"}, title: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, excerpt: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, body: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, published: true, featured: false, publishedAt: new Date() },
    create: { id: "seed-news-3", slug: {"vi":"vinfast-vf-3-lai-thu-tai-ngai-giao-cung-vinfast-ong-sai-gon","en":"vinfast-vf-3-lai-thu-tai-ngai-giao-cung-vinfast-ong-sai-gon"}, title: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, excerpt: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, body: {"vi":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn","en":"VinFast VF 3 – Lái thử tại Ngãi Giao Cùng VinFast Đông Sài Gòn"}, published: true, featured: false, publishedAt: new Date() },
  });

  console.log("Scraped catalog seed complete (13 models).");
}

async function main() {
  await runScrapedSeed();
}

if (process.argv[1]?.endsWith("seed-scraped.js")) {
  main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
