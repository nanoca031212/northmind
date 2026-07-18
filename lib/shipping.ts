export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  eta: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "shr_1TuOvrHWAF0tmQjWWGsX9dK5",
    name: "Free Delivery",
    price: 0,
    eta: "15-20 business days",
  },
  {
    id: "shr_1TuOzWHWAF0tmQjWt55w9gPX",
    name: "Fast Delivery",
    price: 9.99,
    eta: "7-8 business days",
  },
];
