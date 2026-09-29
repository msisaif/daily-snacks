"use client";

import { useEffect } from "react";

// শুধু প্রোডাকশনে; dev-এ চালালে পুরোনো ফাইল ক্যাশে আটকে থাকার ঝামেলা হতে পারে
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("Service worker রেজিস্টার হয়নি", error));
  }, []);

  return null;
}
