import { NextRequest, NextResponse } from "next/server";
import { sendToAllUtmfyPixels } from "@/lib/utmfy";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, trackingParameters, amount, products, eventId } = body;

    // Read settings from DB
    let GBP_TO_BRL = 7.4;
    let utmifyKeys: (string | null)[] = [];
    try {
      const s = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
      if (s?.gbpToBrlRate) GBP_TO_BRL = s.gbpToBrlRate;
      utmifyKeys = [s?.utmifyMetaApiKey, s?.utmifyTiktokApiKey, s?.utmifyGoogleApiKey];
    } catch {}

    console.log(`[UTMify] 🛒 IC: ${customer?.email} — firing to ${utmifyKeys.filter(Boolean).length || "env"} pixel(s)`);

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    const totalInCents = Math.round(amount * 100 * GBP_TO_BRL);

    const data = {
      orderId: `ic_${Date.now()}`,
      platform: "stripe",
      paymentMethod: "credit_card",
      status: "waiting_payment",
      createdAt: now,
      approvedDate: null,
      refundedAt: null,
      customer: {
        name: customer?.name || "Customer",
        email: customer?.email || "cliente@email.com",
        phone: customer?.phone || null,
        document: null,
        address: {
          country: customer?.country || "GB",
          state: customer?.state || null,
          city: customer?.city || null,
          zipCode: customer?.postcode || null,
          street: customer?.address || null,
          complement: customer?.complement || null,
        },
      },
      trackingParameters: {
        ...trackingParameters,
        utm_content: trackingParameters?.utm_content || null,
        utm_term: trackingParameters?.utm_term || null,
      },
      commission: {
        totalPriceInCents: totalInCents,
        gatewayFeeInCents: Math.round(totalInCents * 0.04),
        userCommissionInCents: totalInCents - Math.round(totalInCents * 0.04),
      },
      products: products
        ? products.map((p: any) => ({
            id: p.id || "p1",
            name: p.name || "Product",
            planId: p.id || "p1",
            planName: p.name || "Product",
            quantity: p.quantity || 1,
            priceInCents: p.priceInCents || totalInCents,
          }))
        : [
            {
              id: "checkout_start",
              name: "Checkout Initiation",
              planId: "checkout_start",
              planName: "Checkout Initiation",
              quantity: 1,
              priceInCents: totalInCents,
            },
          ],
    };

    await sendToAllUtmfyPixels(data, utmifyKeys);

    // Meta Conversions API (S2S) — event_id (when provided by the client) matches the fbq call for dedup
    sendMetaCapiEvent({
      eventName: "InitiateCheckout",
      eventId: eventId || data.orderId,
      eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL || "https://northmind.uk",
      value: Number(amount?.toFixed?.(2) ?? amount ?? 0),
      currency: "GBP",
      contentIds: products?.map((p: any) => p.id) || undefined,
      contentType: "product",
      numItems: products?.reduce((acc: number, p: any) => acc + (p.quantity || 1), 0),
      user: {
        email: customer?.email,
        phone: customer?.phone,
        clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
        userAgent: req.headers.get("user-agent"),
        fbc: req.cookies.get("_fbc")?.value || null,
        fbp: req.cookies.get("_fbp")?.value || null,
      },
    }).catch((err) => console.error("[MetaCAPI] InitiateCheckout failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UTMify] Error tracking IC:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
