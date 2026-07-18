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
    eta: "",
  },
  {
    id: "shr_1TuOzWHWAF0tmQjWt55w9gPX",
    name: "Priority Delivery",
    price: 9.99,
    eta: "7-9 Working Days",
  },
];
