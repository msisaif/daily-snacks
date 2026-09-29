import type { Metadata, Viewport } from "next";
import { Baloo_Da_2, Noto_Sans_Bengali } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
});

// শিরোনাম আর লোগো-লেখার জন্য
const balooDa = Baloo_Da_2({
  variable: "--font-baloo",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: { default: "ডেইলি স্ন্যাকস", template: "%s · ডেইলি স্ন্যাকস" },
  description: "Medigene IT বিভাগের দৈনিক নাস্তা বাছাই",
  applicationName: "ডেইলি স্ন্যাকস",
  // iPhone-এ হোম স্ক্রিন থেকে খুললে আলাদা অ্যাপের মতো
  appleWebApp: { capable: true, title: "ডেইলি স্ন্যাকস", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // মোবাইলের নিচের বারটা হোম-বার এলাকা পর্যন্ত যায়, globals.css-এ safe-area প্যাডিং
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${balooDa.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-slate-900">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
