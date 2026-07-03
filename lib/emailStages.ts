export const STAGE_ORDER_CONFIRM = "Order confirm";
export const STAGE_IN_PREPARATION = "In preparation";
export const STAGE_PROCESSING_UPDATE = "Processing update";
export const STAGE_DISPATCHED = "Dispatched";
export const STAGE_IN_TRANSIT = "In transit";
export const STAGE_DELIVERY_UPDATE = "Delivery update";
export const STAGE_FINAL_STAGE = "Final stage";
export const STAGE_POST_DELIVERY = "Post-delivery";
export const STAGE_COMPLETED = "Completed";

export const STAGE_OPTIONS = [
  STAGE_ORDER_CONFIRM,
  STAGE_IN_PREPARATION,
  STAGE_PROCESSING_UPDATE,
  STAGE_DISPATCHED,
  STAGE_IN_TRANSIT,
  STAGE_DELIVERY_UPDATE,
  STAGE_FINAL_STAGE,
  STAGE_POST_DELIVERY,
  STAGE_COMPLETED,
];

// Stage a customer moves to once their current-stage email has been sent.
// STAGE_COMPLETED has no entry — it's the terminal stage, no more emails are sent.
export const STAGE_NEXT: Record<string, string> = {
  [STAGE_ORDER_CONFIRM]: STAGE_IN_PREPARATION,
  [STAGE_IN_PREPARATION]: STAGE_PROCESSING_UPDATE,
  [STAGE_PROCESSING_UPDATE]: STAGE_DISPATCHED,
  [STAGE_DISPATCHED]: STAGE_IN_TRANSIT,
  [STAGE_IN_TRANSIT]: STAGE_DELIVERY_UPDATE,
  [STAGE_DELIVERY_UPDATE]: STAGE_FINAL_STAGE,
  [STAGE_FINAL_STAGE]: STAGE_POST_DELIVERY,
  [STAGE_POST_DELIVERY]: STAGE_COMPLETED,
};

type StageTemplate = { subject: string; body: (name: string) => string };

const STAGE_TEMPLATES: Record<string, StageTemplate> = {
  [STAGE_ORDER_CONFIRM]: {
    subject: "Your order has been confirmed",
    body: (name) =>
      `<p>Hello ${name},</p><p>Your order has been successfully placed.</p><p>We are now preparing it for dispatch.</p><p>You will receive your tracking code within the next few days.</p>`,
  },
  [STAGE_IN_PREPARATION]: {
    subject: "Your order is being prepared",
    body: () =>
      `<p>Your order is currently being processed and prepared for dispatch.</p><p>Due to high demand, your tracking code will be sent within 3 to 5 days.</p>`,
  },
  [STAGE_PROCESSING_UPDATE]: {
    subject: "Your order is almost ready to ship",
    body: () =>
      `<p>Your order is in the final stage of preparation and is leaving our distribution centre.</p><p>You will receive your tracking code shortly.</p>`,
  },
  [STAGE_DISPATCHED]: {
    subject: "Your order has been dispatched",
    body: () =>
      `<p>Your order has been dispatched.</p><div style="margin:32px 0;padding:24px;border-radius:4px;background-color:#fcfcfc;border:1px solid #eeeeee;">  <p style="margin:0 0 12px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888888;font-weight:700;">Tracking Details</p>  <p style="margin:0 0 8px 0;font-size:16px;color:#000000;">Tracking number: <strong>22</strong></p>  <p style="margin:0;font-size:16px;">Track your order here: <a href="https://example.com/track/22" style="color:#0D9488;font-weight:700;text-decoration:underline;">Track your order</a></p></div><p>Tracking updates may take a few days to appear.</p>`,
  },
  [STAGE_IN_TRANSIT]: {
    subject: "Your order is on its way",
    body: () =>
      `<p>Your order is on its way.</p><p>At this stage, it is in international transit.</p><p>Tracking updates may take a few days to reflect new movements.</p><p>Due to the high demand during this period, we are offering you a 10% discount on your next order.</p><div style="margin-top:32px;padding:24px;border-radius:4px;background-color:#ffffff;border:1px solid #0D9488;color:#000000;text-align:center;">  <p style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#0D9488;">Exclusive Reward</p>  <p style="margin:0;font-size:20px;font-weight:800;letter-spacing:0.1em;">Use code: NEXT10</p></div>`,
  },
  [STAGE_DELIVERY_UPDATE]: {
    subject: "Delivery update on your order",
    body: () =>
      `<p>Your order is currently progressing through international logistics.</p><p>At this stage, it may go through intermediate processing before final delivery.</p><p>Tracking updates may take a few days to reflect this stage.</p><p>Most orders are delivered within the expected timeframe.</p><p>If you require any assistance, our support team is available.</p>`,
  },
  [STAGE_FINAL_STAGE]: {
    subject: "Your order is in its final stage of delivery",
    body: () =>
      `<p>Your order is in the final stage of delivery.</p><p>Local carrier handling may vary depending on your area.</p><p>Please monitor your tracking for final updates.</p>`,
  },
  [STAGE_POST_DELIVERY]: {
    subject: "Your order has been delivered",
    body: () =>
      `<p>Your order has been delivered.</p><p>If you require any support, please contact us — we'll be pleased to assist you.</p><p><strong>North Mind Team</strong></p><p>As a valued customer, you can unlock an exclusive discount by creating your account with us.</p>`,
  },
};

export function getStageEmailContent(stage: string, name: string) {
  const template = STAGE_TEMPLATES[stage];
  if (!template) return null;
  return { subject: template.subject, html: template.body(name) };
}
