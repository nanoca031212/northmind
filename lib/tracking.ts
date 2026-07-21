// Tracking utilities for Meta, TikTok and UTMify
// Standardizes e-commerce events across the platform

interface Product {
  id: string;
  title: string;
  price: number;
  quantity?: number;
  selectedSize?: string;
}

const getGbpToBrlRate = (): number => {
  if (typeof window !== "undefined") {
    return (window as any).__NM_CONFIG__?.gbpToBrlRate || 7.4;
  }
  return 7.4;
};

const getCustomerData = () => {
  if (typeof window === 'undefined') return {};
  const email = localStorage.getItem('nm_customer_email');
  return email ? { email } : {};
};

const hasMarketingConsent = (): boolean => {
  return typeof window !== 'undefined';
};

let homeWorldCupFired = false;

export const trackHomeWorldCup = () => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (homeWorldCupFired) return;
  homeWorldCupFired = true;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  console.group('🏠 Tracking: home (worldcup)');

  if (fbq) {
    fbq('trackCustom', 'home');
  }

  if (ttq) {
    ttq.track('home');
  }

  console.groupEnd();
};

let pradaCollectionFired = false;

export const trackPradaCollection = () => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (pradaCollectionFired) return;
  pradaCollectionFired = true;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  console.group('🕶️ Tracking: Prada');

  if (fbq) {
    fbq('trackCustom', 'Prada');
  }

  if (ttq) {
    ttq.track('Prada');
  }

  console.groupEnd();
};

let lastPageProductFiredFor: string | null = null;

export const trackPageProduct = (pathname: string) => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (lastPageProductFiredFor === pathname) return;
  lastPageProductFiredFor = pathname;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  console.group('📄 Tracking: Page Product');

  if (fbq) {
    fbq('trackCustom', 'Page Product');
  }

  if (ttq) {
    ttq.track('Page Product');
  }

  console.groupEnd();
};

let registerPageFired = false;

export const trackRegisterPage = () => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (registerPageFired) return;
  registerPageFired = true;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  console.group('📝 Tracking: Página cadastro');

  if (fbq) {
    fbq('trackCustom', 'Página cadastro');
  }

  if (ttq) {
    ttq.track('Página cadastro');
  }

  console.groupEnd();
};

let loginPageFired = false;

export const trackLoginPage = () => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (loginPageFired) return;
  loginPageFired = true;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  console.group('🔑 Tracking: Login');

  if (fbq) {
    fbq('trackCustom', 'Login');
  }

  if (ttq) {
    ttq.track('Login');
  }

  console.groupEnd();
};

let lastViewProductFiredFor: string | null = null;

export const trackViewProduct = (product: Product) => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;
  if (lastViewProductFiredFor === product.id) return;
  lastViewProductFiredFor = product.id;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;
  const utmHelper = (window as any).utmHelper;
  const rate = getGbpToBrlRate();

  console.group('👀 Tracking: ViewProduct');

  // Meta Pixel
  if (fbq) {
    fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: Number(product.price.toFixed(2)),
      currency: 'GBP',
    });
  }

  // TikTok Pixel
  if (ttq) {
    ttq.track('ViewContent', {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        quantity: 1,
        price: Number(product.price.toFixed(2)),
      }],
      content_type: 'product',
      value: Number(product.price.toFixed(2)),
      currency: 'GBP',
    });
  }

  // UTMify
  if (utmHelper && typeof utmHelper.send === 'function') {
    utmHelper.send('view_item', {
      ...getCustomerData(),
      totalPriceInCents: Math.round(product.price * 100 * rate),
      products: [{
        id: product.id,
        name: product.title,
        priceInCents: Math.round(product.price * 100 * rate),
        quantity: 1
      }]
    });
  }

  console.groupEnd();
};

export const trackAddToCart = (product: Product, quantity: number = 1) => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;
  const utmHelper = (window as any).utmHelper;
  const rate = getGbpToBrlRate();

  console.group('🛒 Tracking: AddToCart');

  // Meta Pixel
  if (fbq) {
    fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.title,
      content_type: 'product',
      value: Number((product.price * quantity).toFixed(2)),
      currency: 'GBP',
    });
  }

  // TikTok Pixel
  if (ttq) {
    ttq.track('AddToCart', {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        quantity: quantity,
        price: Number(product.price.toFixed(2)),
      }],
      content_type: 'product',
      value: Number((product.price * quantity).toFixed(2)),
      currency: 'GBP',
    });
  }

  // UTMify
  if (utmHelper && typeof utmHelper.send === 'function') {
    utmHelper.send('add_to_cart', {
      ...getCustomerData(),
      totalPriceInCents: Math.round(product.price * quantity * 100 * rate),
      products: [{
        id: product.id,
        name: product.title,
        priceInCents: Math.round(product.price * 100 * rate),
        quantity: quantity
      }]
    });
  }

  console.groupEnd();
};

export const trackBeginCheckout = (cart: Product[], totalPrice: number, eventId?: string) => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;
  const utmHelper = (window as any).utmHelper;
  const rate = getGbpToBrlRate();

  // Customer data stored by CheckoutForm before calling this function
  const storedEmail = localStorage.getItem('nm_customer_email');
  const storedPhone = localStorage.getItem('nm_customer_phone');

  console.group('💳 Tracking: InitiateCheckout');

  // Meta Pixel — update advanced matching if customer data is available
  if (fbq) {
    const pixelId = (window as any).__NM_CONFIG__?.metaPixelId;
    if (pixelId && (storedEmail || storedPhone)) {
      const userData: Record<string, string> = {};
      if (storedEmail) userData.em = storedEmail.toLowerCase().trim();
      if (storedPhone) userData.ph = storedPhone.replace(/\D/g, '');
      fbq('init', pixelId, userData);
    }
    fbq('track', 'InitiateCheckout', {
      content_ids: cart.map(item => item.id),
      content_type: 'product',
      value: Number(totalPrice.toFixed(2)),
      currency: 'GBP',
      num_items: cart.reduce((acc, item) => acc + (item.quantity ?? 1), 0),
    }, eventId ? { eventID: eventId } : undefined);
  }

  // TikTok Pixel
  if (ttq) {
    ttq.track('InitiateCheckout', {
      contents: cart.map(item => ({
        content_id: item.id,
        content_name: item.title,
        quantity: item.quantity ?? 1,
        price: Number(item.price.toFixed(2)),
      })),
      content_type: 'product',
      value: Number(totalPrice.toFixed(2)),
      currency: 'GBP',
    });
  }

  // UTMify
  if (utmHelper && typeof utmHelper.send === 'function') {
    utmHelper.send('initiate_checkout', {
      ...getCustomerData(),
      totalPriceInCents: Math.round(totalPrice * 100 * rate),
      products: cart.map(item => ({
        id: item.id,
        name: item.title,
        priceInCents: Math.round(item.price * 100 * rate),
        quantity: item.quantity ?? 1
      }))
    });
  }

  console.groupEnd();
};

export const trackPurchase = (order: { id: string; amount: number; email?: string }) => {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return;

  const fbq = (window as any).fbq;
  const ttq = (window as any).ttq;

  // Customer data stored during checkout (for advanced matching)
  const storedEmail = localStorage.getItem('nm_customer_email');
  const storedPhone = localStorage.getItem('nm_customer_phone');

  console.group('✨ Tracking: Purchase');

  // Meta Pixel — update advanced matching then fire Purchase
  if (fbq) {
    const pixelId = (window as any).__NM_CONFIG__?.metaPixelId;
    if (pixelId && (storedEmail || storedPhone)) {
      const userData: Record<string, string> = {};
      if (storedEmail) userData.em = storedEmail.toLowerCase().trim();
      if (storedPhone) userData.ph = storedPhone.replace(/\D/g, '');
      fbq('init', pixelId, userData);
    }
    fbq('track', 'Purchase', {
      value: Number(order.amount.toFixed(2)),
      currency: 'GBP',
      order_id: order.id,
      content_type: 'product',
    }, { eventID: order.id });
  }

  // TikTok Pixel — identify then fire CompletePayment
  if (ttq) {
    if (storedEmail || storedPhone) {
      ttq.identify({
        ...(storedEmail && { email: storedEmail }),
        ...(storedPhone && { phone_number: storedPhone }),
      });
    }
    ttq.track('CompletePayment', {
      content_type: 'product',
      value: Number(order.amount.toFixed(2)),
      currency: 'GBP',
      contents: [{
        id: order.id,
        name: 'North Mind Order',
        quantity: 1,
        price: Number(order.amount.toFixed(2))
      }]
    });
  }

  console.groupEnd();
  // Note: UTMify browser pixel is handled by trackUtmfyPurchase (called separately)
  // to avoid double-firing with the server-side S2S event
};

export const trackUtmfyPurchase = (order: { id: string; amountInBRL: number; email?: string }) => {
  if (typeof window === 'undefined') return;

  const utmHelper = (window as any).utmHelper;

  console.group('📊 Tracking: UTMify Purchase (Manual)');

  if (utmHelper && typeof utmHelper.send === 'function') {
    utmHelper.send('purchase', {
      orderId: order.id,
      totalPriceInCents: Math.round(order.amountInBRL * 100),
      platform: 'stripe',
      paymentMethod: 'credit_card',
      status: 'paid',
    });
  }

  console.groupEnd();
};
