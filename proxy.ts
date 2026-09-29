import { NextResponse, type NextRequest } from "next/server";

// শুধু কুকি আছে কিনা দেখে; আসল যাচাই হয় সার্ভারে requireUser()-এ
export function proxy(request: NextRequest) {
  if (!request.cookies.has("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // লগইন পেজ, স্ট্যাটিক ফাইল, আইকন আর PWA-র ফাইলগুলো কুকি ছাড়াই আসতে হবে
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|sw.js|offline.html|icons/).*)",
  ],
};
