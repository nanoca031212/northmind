// Meta Conversions API (CAPI) — server-side event delivery to graph.facebook.com
// Complements the browser Pixel; matching event_id lets Meta dedupe both signals.
import crypto from "crypto";

const META_GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaCapiUserData {
  email?: string | null;
  phone?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
}

export interface MetaCapiEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  user: MetaCapiUserData;
}

export async function sendMetaCapiEvent(params: MetaCapiEventParams): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("[MetaCAPI] Pixel ID ou access token não configurado — evento ignorado");
    return false;
  }

  const userData: Record<string, unknown> = {};
  if (params.user.email) userData.em = [sha256(params.user.email)];
  if (params.user.phone) userData.ph = [sha256(params.user.phone.replace(/\D/g, ""))];
  if (params.user.clientIp) userData.client_ip_address = params.user.clientIp;
  if (params.user.userAgent) userData.client_user_agent = params.user.userAgent;
  if (params.user.fbc) userData.fbc = params.user.fbc;
  if (params.user.fbp) userData.fbp = params.user.fbp;

  const customData: Record<string, unknown> = {};
  if (params.value !== undefined) customData.value = params.value;
  if (params.currency) customData.currency = params.currency;
  if (params.contentIds) customData.content_ids = params.contentIds;
  if (params.contentType) customData.content_type = params.contentType;
  if (params.numItems !== undefined) customData.num_items = params.numItems;

  const payload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[MetaCAPI] Error:", res.status, errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[MetaCAPI] Fetch error:", error);
    return false;
  }
}
