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
      update: { name: {"vi":"EC Van","en":"EC Van"}, slug: {"vi":"ec-van","en":"ec-van"}, tagline: {"vi":"VinFast EC Van Nâng cao","en":"VinFast EC Van Nâng cao"}, description: {"vi":"VinFast EC Van Nâng cao. VinFast EC Van Tiêu chuẩn. THÔNG  TIN LIÊN HỆ","en":"VinFast EC Van Nâng cao. VinFast EC Van Tiêu chuẩn. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: modelId, segmentId: segmentIds["van"], name: {"vi":"EC Van","en":"EC Van"}, slug: {"vi":"ec-van","en":"ec-van"}, tagline: {"vi":"VinFast EC Van Nâng cao","en":"VinFast EC Van Nâng cao"}, description: {"vi":"VinFast EC Van Nâng cao. VinFast EC Van Tiêu chuẩn. THÔNG  TIN LIÊN HỆ","en":"VinFast EC Van Nâng cao. VinFast EC Van Tiêu chuẩn. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":150,"unit":"km"},{"key":"power","value":30,"unit":"kW"},{"key":"battery","value":17,"unit":"kWh"},{"key":"seats","value":2,"unit":"seats"}], published: true, sortOrder: 1 },
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
      update: { title: {"vi":"VINFAST EC VAN","en":"VINFAST EC VAN"}, body: {"vi":"VINFAST EC VAN","en":"VINFAST EC VAN"}, sortOrder: 1 },
      create: { id: "seed-feature-ec-van-1", modelId, title: {"vi":"VINFAST EC VAN","en":"VINFAST EC VAN"}, body: {"vi":"VINFAST EC VAN","en":"VINFAST EC VAN"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-2" },
      update: { title: {"vi":"Thông số kỹ thuật","en":"Thông số kỹ thuật"}, body: {"vi":"Thông số kỹ thuật","en":"Thông số kỹ thuật"}, sortOrder: 2 },
      create: { id: "seed-feature-ec-van-2", modelId, title: {"vi":"Thông số kỹ thuật","en":"Thông số kỹ thuật"}, body: {"vi":"Thông số kỹ thuật","en":"Thông số kỹ thuật"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-3" },
      update: { title: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, body: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, sortOrder: 3 },
      create: { id: "seed-feature-ec-van-3", modelId, title: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, body: {"vi":"EC Van Tiện dụng - sinh lời","en":"EC Van Tiện dụng - sinh lời"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-ec-van-4" },
      update: { title: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, body: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, sortOrder: 4 },
      create: { id: "seed-feature-ec-van-4", modelId, title: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, body: {"vi":"Hướng dẫn đặt cọc EC Van","en":"Hướng dẫn đặt cọc EC Van"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-herio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Herio Green","en":"Herio Green"}, slug: {"vi":"vinfast-herio-green","en":"herio-green"}, tagline: {"vi":"VinFast Herio Green","en":"VinFast Herio Green"}, description: {"vi":"VinFast Herio Green. Mô tả. Mô tả","en":"VinFast Herio Green. Mô tả. Mô tả"}, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Herio Green","en":"Herio Green"}, slug: {"vi":"vinfast-herio-green","en":"herio-green"}, tagline: {"vi":"VinFast Herio Green","en":"VinFast Herio Green"}, description: {"vi":"VinFast Herio Green. Mô tả. Mô tả","en":"VinFast Herio Green. Mô tả. Mô tả"}, attributes: [{"key":"range","value":326,"unit":"km"},{"key":"power","value":100,"unit":"kW"},{"key":"battery","value":23,"unit":"kWh"}], published: true, sortOrder: 2 },
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
      update: { title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 4 },
      create: { id: "seed-feature-herio-green-4", modelId, title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-limo-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Limo Green","en":"Limo Green"}, slug: {"vi":"limo-green","en":"limo-green"}, tagline: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, description: {"vi":"VinFast Limo Green. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast Limo Green. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 3 },
      create: { id: modelId, segmentId: segmentIds["mpv"], name: {"vi":"Limo Green","en":"Limo Green"}, slug: {"vi":"limo-green","en":"limo-green"}, tagline: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, description: {"vi":"VinFast Limo Green. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast Limo Green. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 3 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-limo-green-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-limo-green-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-limo-green-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 699000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-limo-green-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 699000000, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":150,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-1" },
      update: { title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 1 },
      create: { id: "seed-feature-limo-green-1", modelId, title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-2" },
      update: { title: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, body: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, sortOrder: 2 },
      create: { id: "seed-feature-limo-green-2", modelId, title: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, body: {"vi":"VinFast Limo Green","en":"VinFast Limo Green"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-3" },
      update: { title: {"vi":"VinFast Hồ Chí Minh","en":"VinFast Hồ Chí Minh"}, body: {"vi":"VinFast Hồ Chí Minh","en":"VinFast Hồ Chí Minh"}, sortOrder: 3 },
      create: { id: "seed-feature-limo-green-3", modelId, title: {"vi":"VinFast Hồ Chí Minh","en":"VinFast Hồ Chí Minh"}, body: {"vi":"VinFast Hồ Chí Minh","en":"VinFast Hồ Chí Minh"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-limo-green-4" },
      update: { title: {"vi":"THÔNG  TIN LIÊN HỆ","en":"THÔNG  TIN LIÊN HỆ"}, body: {"vi":"THÔNG  TIN LIÊN HỆ","en":"THÔNG  TIN LIÊN HỆ"}, sortOrder: 4 },
      create: { id: "seed-feature-limo-green-4", modelId, title: {"vi":"THÔNG  TIN LIÊN HỆ","en":"THÔNG  TIN LIÊN HỆ"}, body: {"vi":"THÔNG  TIN LIÊN HỆ","en":"THÔNG  TIN LIÊN HỆ"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-minio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Minio Green","en":"Minio Green"}, slug: {"vi":"vinfast-minio-green","en":"minio-green"}, tagline: {"vi":"VinFast Minio Green","en":"VinFast Minio Green"}, description: {"vi":"VinFast Minio Green. Mô tả. Mô tả","en":"VinFast Minio Green. Mô tả. Mô tả"}, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 4 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Minio Green","en":"Minio Green"}, slug: {"vi":"vinfast-minio-green","en":"minio-green"}, tagline: {"vi":"VinFast Minio Green","en":"VinFast Minio Green"}, description: {"vi":"VinFast Minio Green. Mô tả. Mô tả","en":"VinFast Minio Green. Mô tả. Mô tả"}, attributes: [{"key":"range","value":170,"unit":"km"},{"key":"power","value":20,"unit":"kW"}], published: true, sortOrder: 4 },
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
      update: { title: {"vi":"Ưu điểm, điểm nổi bật của xe","en":"Ưu điểm, điểm nổi bật của xe"}, body: {"vi":"Ưu điểm, điểm nổi bật của xe","en":"Ưu điểm, điểm nổi bật của xe"}, sortOrder: 1 },
      create: { id: "seed-feature-minio-green-1", modelId, title: {"vi":"Ưu điểm, điểm nổi bật của xe","en":"Ưu điểm, điểm nổi bật của xe"}, body: {"vi":"Ưu điểm, điểm nổi bật của xe","en":"Ưu điểm, điểm nổi bật của xe"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-2" },
      update: { title: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, body: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, sortOrder: 2 },
      create: { id: "seed-feature-minio-green-2", modelId, title: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, body: {"vi":"Dải màu trẻ trung ấn tượng lên tới 14 màu","en":"Dải màu trẻ trung ấn tượng lên tới 14 màu"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-3" },
      update: { title: {"vi":"Chi tiết nội thất","en":"Chi tiết nội thất"}, body: {"vi":"Chi tiết nội thất","en":"Chi tiết nội thất"}, sortOrder: 3 },
      create: { id: "seed-feature-minio-green-3", modelId, title: {"vi":"Chi tiết nội thất","en":"Chi tiết nội thất"}, body: {"vi":"Chi tiết nội thất","en":"Chi tiết nội thất"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-minio-green-4" },
      update: { title: {"vi":"Đăng ký tư vấn","en":"Đăng ký tư vấn"}, body: {"vi":"Đăng ký tư vấn","en":"Đăng ký tư vấn"}, sortOrder: 4 },
      create: { id: "seed-feature-minio-green-4", modelId, title: {"vi":"Đăng ký tư vấn","en":"Đăng ký tư vấn"}, body: {"vi":"Đăng ký tư vấn","en":"Đăng ký tư vấn"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-mpv-7";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF MPV 7","en":"VF MPV 7"}, slug: {"vi":"vinfast-vf-mpv-7","en":"mpv-7"}, tagline: {"vi":"VinFast VF MPV 7","en":"VinFast VF MPV 7"}, description: {"vi":"VinFast VF MPV 7. Mô tả. Mô tả","en":"VinFast VF MPV 7. Mô tả. Mô tả"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 5 },
      create: { id: modelId, segmentId: segmentIds["mpv"], name: {"vi":"VF MPV 7","en":"VF MPV 7"}, slug: {"vi":"vinfast-vf-mpv-7","en":"mpv-7"}, tagline: {"vi":"VinFast VF MPV 7","en":"VinFast VF MPV 7"}, description: {"vi":"VinFast VF MPV 7. Mô tả. Mô tả","en":"VinFast VF MPV 7. Mô tả. Mô tả"}, attributes: [{"key":"range","value":450,"unit":"km"},{"key":"power","value":13,"unit":"kW"},{"key":"battery","value":13,"unit":"kWh"}], published: true, sortOrder: 5 },
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
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-mpv-7-4" },
      update: { title: {"vi":"VF MPV 7","en":"VF MPV 7"}, body: {"vi":"VF MPV 7","en":"VF MPV 7"}, sortOrder: 4 },
      create: { id: "seed-feature-mpv-7-4", modelId, title: {"vi":"VF MPV 7","en":"VF MPV 7"}, body: {"vi":"VF MPV 7","en":"VF MPV 7"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-nerio-green";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"Nerio Green","en":"Nerio Green"}, slug: {"vi":"vinfast-nerio-green","en":"nerio-green"}, tagline: {"vi":"VinFast Nerio Green","en":"VinFast Nerio Green"}, description: {"vi":"VinFast Nerio Green. Mô tả. Mô tả","en":"VinFast Nerio Green. Mô tả. Mô tả"}, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 6 },
      create: { id: modelId, segmentId: segmentIds["sedan"], name: {"vi":"Nerio Green","en":"Nerio Green"}, slug: {"vi":"vinfast-nerio-green","en":"nerio-green"}, tagline: {"vi":"VinFast Nerio Green","en":"VinFast Nerio Green"}, description: {"vi":"VinFast Nerio Green. Mô tả. Mô tả","en":"VinFast Nerio Green. Mô tả. Mô tả"}, attributes: [{"key":"power","value":110,"unit":"kW"}], published: true, sortOrder: 6 },
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
      update: { title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 4 },
      create: { id: "seed-feature-nerio-green-4", modelId, title: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, body: {"vi":"ĐĂNG KÝ TƯ VẤN","en":"ĐĂNG KÝ TƯ VẤN"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-3";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 3","en":"VF 3"}, slug: {"vi":"vf-3","en":"vf-3"}, tagline: {"vi":"VinFast VF 3","en":"VinFast VF 3"}, description: {"vi":"VinFast VF 3. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast VF 3. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 7 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 3","en":"VF 3"}, slug: {"vi":"vf-3","en":"vf-3"}, tagline: {"vi":"VinFast VF 3","en":"VinFast VF 3"}, description: {"vi":"VinFast VF 3. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast VF 3. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"seats","value":4,"unit":"seats"}], published: true, sortOrder: 7 },
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
      update: { title: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, body: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, sortOrder: 4 },
      create: { id: "seed-feature-vf-3-4", modelId, title: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, body: {"vi":"VinFast VF 3 - Xe nhỏ, giá trị lớn.","en":"VinFast VF 3 - Xe nhỏ, giá trị lớn."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-5";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 5 Plus","en":"VF 5 Plus"}, slug: {"vi":"vf-5-plus","en":"vf-5"}, tagline: {"vi":"VinFast VF 5","en":"VinFast VF 5"}, description: {"vi":"VinFast VF 5. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast VF 5. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 8 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 5 Plus","en":"VF 5 Plus"}, slug: {"vi":"vf-5-plus","en":"vf-5"}, tagline: {"vi":"VinFast VF 5","en":"VinFast VF 5"}, description: {"vi":"VinFast VF 5. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG","en":"VinFast VF 5. THÔNG  TIN LIÊN HỆ. HỖ TRỢ KHÁCH HÀNG"}, attributes: [{"key":"range","value":0,"unit":"km"}], published: true, sortOrder: 8 },
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
      update: { title: {"vi":"Cá nhân vượt trội","en":"Cá nhân vượt trội"}, body: {"vi":"Cá nhân vượt trội","en":"Cá nhân vượt trội"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-5-1", modelId, title: {"vi":"Cá nhân vượt trội","en":"Cá nhân vượt trội"}, body: {"vi":"Cá nhân vượt trội","en":"Cá nhân vượt trội"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-2" },
      update: { title: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, body: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-5-2", modelId, title: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, body: {"vi":"Ngoại thất ấn tượng","en":"Ngoại thất ấn tượng"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-3" },
      update: { title: {"vi":"Nội thất tinh tế","en":"Nội thất tinh tế"}, body: {"vi":"Nội thất tinh tế","en":"Nội thất tinh tế"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-5-3", modelId, title: {"vi":"Nội thất tinh tế","en":"Nội thất tinh tế"}, body: {"vi":"Nội thất tinh tế","en":"Nội thất tinh tế"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-5-4" },
      update: { title: {"vi":"GIÁ BÁN VF 5","en":"GIÁ BÁN VF 5"}, body: {"vi":"GIÁ BÁN VF 5","en":"GIÁ BÁN VF 5"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-5-4", modelId, title: {"vi":"GIÁ BÁN VF 5","en":"GIÁ BÁN VF 5"}, body: {"vi":"GIÁ BÁN VF 5","en":"GIÁ BÁN VF 5"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-6";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 6","en":"VF 6"}, slug: {"vi":"vf-6","en":"vf-6"}, tagline: {"vi":"VinFast VF 6 ECO","en":"VinFast VF 6 ECO"}, description: {"vi":"VinFast VF 6 ECO. VinFast VF 6 PLUS. THÔNG  TIN LIÊN HỆ","en":"VinFast VF 6 ECO. VinFast VF 6 PLUS. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 9 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 6","en":"VF 6"}, slug: {"vi":"vf-6","en":"vf-6"}, tagline: {"vi":"VinFast VF 6 ECO","en":"VinFast VF 6 ECO"}, description: {"vi":"VinFast VF 6 ECO. VinFast VF 6 PLUS. THÔNG  TIN LIÊN HỆ","en":"VinFast VF 6 ECO. VinFast VF 6 PLUS. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":480,"unit":"km"},{"key":"power","value":150,"unit":"kW"}], published: true, sortOrder: 9 },
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
      update: { title: {"vi":"VF 6 Eco","en":"VF 6 Eco"}, body: {"vi":"VF 6 Eco","en":"VF 6 Eco"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-6-1", modelId, title: {"vi":"VF 6 Eco","en":"VF 6 Eco"}, body: {"vi":"VF 6 Eco","en":"VF 6 Eco"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-6-2" },
      update: { title: {"vi":"VF 6 Plus","en":"VF 6 Plus"}, body: {"vi":"VF 6 Plus","en":"VF 6 Plus"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-6-2", modelId, title: {"vi":"VF 6 Plus","en":"VF 6 Plus"}, body: {"vi":"VF 6 Plus","en":"VF 6 Plus"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-6-3" },
      update: { title: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, body: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-6-3", modelId, title: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, body: {"vi":"Triết lý thiết kế “Cặp đối lập tự nhiên”","en":"Triết lý thiết kế “Cặp đối lập tự nhiên”"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-6-4" },
      update: { title: {"vi":"VF 6 eco","en":"VF 6 eco"}, body: {"vi":"VF 6 eco","en":"VF 6 eco"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-6-4", modelId, title: {"vi":"VF 6 eco","en":"VF 6 eco"}, body: {"vi":"VF 6 eco","en":"VF 6 eco"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-7";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 7","en":"VF 7"}, slug: {"vi":"vf-7","en":"vf-7"}, tagline: {"vi":"VinFast VF 7 ECO","en":"VinFast VF 7 ECO"}, description: {"vi":"VinFast VF 7 ECO. VinFast VF 7 PLUS. VinFast VF 7 PLUS Trần Kính","en":"VinFast VF 7 ECO. VinFast VF 7 PLUS. VinFast VF 7 PLUS Trần Kính"}, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 10 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 7","en":"VF 7"}, slug: {"vi":"vf-7","en":"vf-7"}, tagline: {"vi":"VinFast VF 7 ECO","en":"VinFast VF 7 ECO"}, description: {"vi":"VinFast VF 7 ECO. VinFast VF 7 PLUS. VinFast VF 7 PLUS Trần Kính","en":"VinFast VF 7 ECO. VinFast VF 7 PLUS. VinFast VF 7 PLUS Trần Kính"}, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 10 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-7-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-7-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-7-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 750000000, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-7-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 750000000, attributes: [{"key":"range","value":504,"unit":"km"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-1" },
      update: { title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
      create: { id: "seed-feature-vf-7-1", modelId, title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-2" },
      update: { title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast."}, sortOrder: 2 },
      create: { id: "seed-feature-vf-7-2", modelId, title: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast."}, body: {"vi":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast.","en":"VF 7 là một bước tiến đột phá trong thiết kế\n\t\t\txe ô tô của VinFast."}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-3" },
      update: { title: {"vi":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô."}, body: {"vi":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô."}, sortOrder: 3 },
      create: { id: "seed-feature-vf-7-3", modelId, title: {"vi":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô."}, body: {"vi":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô.","en":"Ngoại thất kế thừa và đổi mới\n\t\t\ttừ hơn trăm năm lịch sử của ngành ô tô."}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-7-4" },
      update: { title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 4 },
      create: { id: "seed-feature-vf-7-4", modelId, title: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, body: {"vi":"Tùy chọn cho ngân sách của bạn.","en":"Tùy chọn cho ngân sách của bạn."}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-8";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 8","en":"VF 8"}, slug: {"vi":"vf-8","en":"vf-8"}, tagline: {"vi":"VinFast VF 8 ECO","en":"VinFast VF 8 ECO"}, description: {"vi":"VinFast VF 8 ECO. VinFast VF 8 PLUS. VinFast VF8 All New","en":"VinFast VF 8 ECO. VinFast VF 8 PLUS. VinFast VF8 All New"}, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 11 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 8","en":"VF 8"}, slug: {"vi":"vf-8","en":"vf-8"}, tagline: {"vi":"VinFast VF 8 ECO","en":"VinFast VF 8 ECO"}, description: {"vi":"VinFast VF 8 ECO. VinFast VF 8 PLUS. VinFast VF8 All New","en":"VinFast VF 8 ECO. VinFast VF 8 PLUS. VinFast VF8 All New"}, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 11 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-8-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-8-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-8-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 898000000, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-8-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 898000000, attributes: [{"key":"range","value":500,"unit":"km"},{"key":"power","value":170,"unit":"kW"},{"key":"battery","value":60,"unit":"kWh"}], published: true, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-1" },
      update: { title: {"vi":"VF 8 series mới","en":"VF 8 series mới"}, body: {"vi":"VF 8 series mới","en":"VF 8 series mới"}, sortOrder: 1 },
      create: { id: "seed-feature-vf-8-1", modelId, title: {"vi":"VF 8 series mới","en":"VF 8 series mới"}, body: {"vi":"VF 8 series mới","en":"VF 8 series mới"}, sortOrder: 1 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-2" },
      update: { title: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, body: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-8-2", modelId, title: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, body: {"vi":"Thiết kế cá nhân hoá","en":"Thiết kế cá nhân hoá"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-3" },
      update: { title: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, body: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-8-3", modelId, title: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, body: {"vi":"Thiết kế khí động học​","en":"Thiết kế khí động học​"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-8-4" },
      update: { title: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, body: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-8-4", modelId, title: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, body: {"vi":"Khi phong cáchtrở thành dấu ấn","en":"Khi phong cáchtrở thành dấu ấn"}, sortOrder: 4 },
    });
  }
  {
    const modelId = "seed-model-vf-9";
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: {"vi":"VF 9","en":"VF 9"}, slug: {"vi":"vf-9","en":"vf-9"}, tagline: {"vi":"VinFast VF 9 ECO","en":"VinFast VF 9 ECO"}, description: {"vi":"VinFast VF 9 ECO. VinFast VF 9 PLUS. THÔNG  TIN LIÊN HỆ","en":"VinFast VF 9 ECO. VinFast VF 9 PLUS. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 12 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF 9","en":"VF 9"}, slug: {"vi":"vf-9","en":"vf-9"}, tagline: {"vi":"VinFast VF 9 ECO","en":"VinFast VF 9 ECO"}, description: {"vi":"VinFast VF 9 ECO. VinFast VF 9 PLUS. THÔNG  TIN LIÊN HỆ","en":"VinFast VF 9 ECO. VinFast VF 9 PLUS. THÔNG  TIN LIÊN HỆ"}, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 12 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-9-1" },
      update: { name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
      create: { id: "seed-variant-vf-9-1", modelId, name: {"vi":"Tiêu chuẩn","en":"Standard"}, price: null, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 1 },
    });
    await prisma.vehicleVariant.upsert({
      where: { id: "seed-variant-vf-9-2" },
      update: { name: {"vi":"Giá từ","en":"From"}, price: 1348000000, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
      create: { id: "seed-variant-vf-9-2", modelId, name: {"vi":"Giá từ","en":"From"}, price: 1348000000, attributes: [{"key":"range","value":626,"unit":"km"},{"key":"seats","value":7,"unit":"seats"}], published: true, sortOrder: 2 },
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
      update: { name: {"vi":"VF e34","en":"VF e34"}, slug: {"vi":"vf-e34","en":"vf-e34"}, tagline: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, description: {"vi":"Cùng bạn bứt phá mọi giới hạn. Mẫu C-SUV với\nthiết kế tinh tế. Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Cùng bạn bứt phá mọi giới hạn. Mẫu C-SUV với\nthiết kế tinh tế. Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, attributes: [], published: true, sortOrder: 13 },
      create: { id: modelId, segmentId: segmentIds["suv"], name: {"vi":"VF e34","en":"VF e34"}, slug: {"vi":"vf-e34","en":"vf-e34"}, tagline: {"vi":"Cùng bạn bứt phá mọi giới hạn","en":"Cùng bạn bứt phá mọi giới hạn"}, description: {"vi":"Cùng bạn bứt phá mọi giới hạn. Mẫu C-SUV với\nthiết kế tinh tế. Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Cùng bạn bứt phá mọi giới hạn. Mẫu C-SUV với\nthiết kế tinh tế. Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, attributes: [], published: true, sortOrder: 13 },
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
      update: { title: {"vi":"Mẫu C-SUV với\nthiết kế tinh tế","en":"Mẫu C-SUV với\nthiết kế tinh tế"}, body: {"vi":"Mẫu C-SUV với\nthiết kế tinh tế","en":"Mẫu C-SUV với\nthiết kế tinh tế"}, sortOrder: 2 },
      create: { id: "seed-feature-vf-e34-2", modelId, title: {"vi":"Mẫu C-SUV với\nthiết kế tinh tế","en":"Mẫu C-SUV với\nthiết kế tinh tế"}, body: {"vi":"Mẫu C-SUV với\nthiết kế tinh tế","en":"Mẫu C-SUV với\nthiết kế tinh tế"}, sortOrder: 2 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-3" },
      update: { title: {"vi":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, body: {"vi":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, sortOrder: 3 },
      create: { id: "seed-feature-vf-e34-3", modelId, title: {"vi":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, body: {"vi":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn","en":"Ngoại thất hiện đại\nthu hút mọi ánh nhìn"}, sortOrder: 3 },
    });
    await prisma.featureSection.upsert({
      where: { id: "seed-feature-vf-e34-4" },
      update: { title: {"vi":"Nội thất rộng rãi,\ntiện nghi và hiện đại","en":"Nội thất rộng rãi,\ntiện nghi và hiện đại"}, body: {"vi":"Nội thất rộng rãi,\ntiện nghi và hiện đại","en":"Nội thất rộng rãi,\ntiện nghi và hiện đại"}, sortOrder: 4 },
      create: { id: "seed-feature-vf-e34-4", modelId, title: {"vi":"Nội thất rộng rãi,\ntiện nghi và hiện đại","en":"Nội thất rộng rãi,\ntiện nghi và hiện đại"}, body: {"vi":"Nội thất rộng rãi,\ntiện nghi và hiện đại","en":"Nội thất rộng rãi,\ntiện nghi và hiện đại"}, sortOrder: 4 },
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
