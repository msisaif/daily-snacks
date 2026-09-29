import type { MetadataRoute } from "next";

// ফোনে/কম্পিউটারে অ্যাপ হিসেবে ইনস্টলের তথ্য; আইকনগুলো public/icons/-এ
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ডেইলি স্ন্যাকস",
    short_name: "ডেইলি স্ন্যাকস",
    description: "Medigene IT বিভাগের দৈনিক নাস্তা বাছাই",
    lang: "bn",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f3",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "সারাংশ", url: "/summary" },
      { name: "ইতিহাস", url: "/history" },
    ],
  };
}
