"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackHomeWorldCup, trackPradaCollection, trackPageProduct, trackRegisterPage, trackLoginPage } from "@/lib/tracking";

export function PixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track on client side
    if (typeof window !== "undefined") {
      const fbq = (window as any).fbq;
      const ttq = (window as any).ttq;

      // Facebook Pixel PageView
      if (fbq) {
        fbq("track", "PageView");
      }

      // TikTok Pixel PageView
      if (ttq) {
        ttq.page();
      }

      // Custom event: home page entered with the World Cup theme active
      if (pathname === "/" && searchParams.get("theme") === "worldcup") {
        trackHomeWorldCup();
      }

      // Custom event: Prada collection page entered
      if (pathname === "/collections/prada") {
        trackPradaCollection();
      }

      // Custom event: any product page entered
      if (pathname.startsWith("/product/")) {
        trackPageProduct(pathname);
      }

      // Custom event: registration page entered
      if (pathname === "/register") {
        trackRegisterPage();
      }

      // Custom event: user dashboard page entered
      if (pathname === "/user") {
        trackLoginPage();
      }
    }
  }, [pathname, searchParams]);

  return null;
}
