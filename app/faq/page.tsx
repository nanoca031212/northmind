"use client";

import React from "react";
import { PolicyLayout } from "@/components/PolicyLayout";

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Where do you ship?",
    answer: (
      <p>
        We currently ship to the United Kingdom and selected international
        destinations. Every order is securely packaged and fully trackable
        from dispatch to delivery.
      </p>
    ),
  },
  {
    question: "How long does shipping take?",
    answer: (
      <div className="space-y-4">
        <p>Orders are processed within 1–3 business days.</p>
        <div className="space-y-2">
          <p>Estimated delivery times:</p>
          <ul className="space-y-2">
            {[
              "United Kingdom: 5–10 business days",
              "Europe: 6–12 business days",
              "International: 7–15 business days",
            ].map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0 light:bg-black" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <p>
          During periods of high demand, shipping times may vary slightly.
        </p>
      </div>
    ),
  },
  {
    question: "How can I track my order?",
    answer: (
      <p>
        Once your order has been dispatched, you&apos;ll receive a
        confirmation email containing your tracking number. You can monitor
        your shipment at every stage until delivery.
      </p>
    ),
  },
  {
    question: "Do you offer free shipping?",
    answer: (
      <p>
        Yes. We offer complimentary shipping on qualifying orders and
        selected promotional collections. Any applicable free shipping
        offers will be displayed at checkout.
      </p>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <div className="space-y-4">
        <p>We accept:</p>
        <ul className="space-y-2">
          {[
            "Visa",
            "Mastercard",
            "American Express",
            "Apple Pay",
            "Google Pay",
            "Shop Pay",
          ].map((method, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0 light:bg-black" />
              <span>{method}</span>
            </li>
          ))}
        </ul>
        <p>
          All transactions are protected using industry-standard encrypted
          payment technology.
        </p>
      </div>
    ),
  },
  {
    question: "Can I return my order?",
    answer: (
      <div className="space-y-4">
        <p>
          Yes. You may request a return within 30 days of receiving your
          order, provided the item is unused, in its original condition, and
          returned in its original packaging.
        </p>
        <p>Please contact our support team before sending any item back.</p>
      </div>
    ),
  },
  {
    question: "What if my item arrives damaged or defective?",
    answer: (
      <div className="space-y-4">
        <p>
          If your order arrives damaged or defective, please contact us
          within 48 hours of delivery with your order number and clear
          photographs of the item.
        </p>
        <p>
          Our team will arrange a replacement or refund as quickly as
          possible.
        </p>
      </div>
    ),
  },
  {
    question: "Can I cancel or modify my order?",
    answer: (
      <div className="space-y-4">
        <p>
          Orders may be cancelled or modified within 12 hours of purchase.
        </p>
        <p>
          Once your order enters processing, we may no longer be able to
          make changes or cancel it.
        </p>
      </div>
    ),
  },
  {
    question: "Are North Mind products quality inspected?",
    answer: (
      <p>
        Absolutely. Every North Mind product undergoes a quality inspection
        before dispatch to ensure it meets our standards of craftsmanship,
        durability, and refined design.
      </p>
    ),
  },
  {
    question: "How can I contact North Mind?",
    answer: (
      <div className="space-y-1">
        <p>Customer Support</p>
        <p>Monday – Friday</p>
        <p>9:00 AM – 6:00 PM (GMT)</p>
        <p>
          Email:{" "}
          <a
            href="mailto:contact@northmind.shop"
            className="hover:text-white/70 transition-colors light:hover:text-black/70"
          >
            contact@northmind.shop
          </a>
        </p>
        <p>Response time: Within 24 hours.</p>
      </div>
    ),
  },
];

export default function FAQPage() {
  return (
    <PolicyLayout title="Common Inquiries" lastUpdated="April 2026">
      <div className="space-y-16">
        <p className="text-sm text-white/50 leading-relaxed font-light light:text-black/50">
          Everything you need to know before placing your order.
        </p>

        <div className="space-y-12">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="space-y-4 pb-10 border-b border-white/10 last:border-0 last:pb-0 light:border-black/10"
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-white light:text-black">
                {faq.question}
              </h3>
              <div className="text-sm text-white/60 leading-relaxed light:text-black/60">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 space-y-4 text-center max-w-2xl mx-auto light:border-black/10">
          <h2 className="text-xs font-black uppercase tracking-widest text-white light:text-black">
            Why Choose North Mind?
          </h2>
          <p className="text-sm text-white/60 leading-relaxed light:text-black/60">
            North Mind was built around one principle:{" "}
            <strong>Silent Luxury</strong>. We create timeless essentials for
            individuals who value craftsmanship, understated elegance, and
            lasting quality over passing trends.
          </p>
          <p className="text-sm text-white/60 leading-relaxed light:text-black/60">
            Every collection is designed to balance refined aesthetics with
            modern functionality, delivering products that are made to be
            worn, appreciated, and remembered.
          </p>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white pt-4 light:text-black">
            Built for the Bold.
          </p>
        </div>
      </div>
    </PolicyLayout>
  );
}
