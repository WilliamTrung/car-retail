import type { ShowroomVM } from "./showroom";

export interface SiteChromeVM {
  logoText: { primary: string; accent: string };
  nav: { label: string; href: string }[];
  hotline: { display: string; tel: string };
  zaloUrl: string;
  legal: {
    companyName: string;
    mst: string;
    hqAddress: string;
    copyright: string;
  };
  socials: {
    kind: "facebook" | "youtube" | "zalo" | "tiktok" | "instagram";
    url: string;
  }[];
  showrooms: ShowroomVM[];
  footerLinks: { label: string; href: string }[];
  contactEmail: string;
  workingHours: string;
}
