/** Store-wide settings for the demo storefront. All values are mock policy. */
export const site = {
  name: "Stockroom",
  tagline: "Everything on the shelf, one search away.",
  freeShippingThreshold: 50,
  standardShipping: 5.99,
  expressShipping: 14.99,
  /** Estimated sales tax rate used for display only. */
  estimatedTaxRate: 0.08,
  maxQuantityPerItem: 10,
  supportEmail: "support@stockroom.example",
  supportHours: "Monday to Friday, 9 am to 6 pm ET",
} as const;

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface FaqSection {
  id: string;
  title: string;
  entries: FaqEntry[];
}

export const faqSections: FaqSection[] = [
  {
    id: "demo",
    title: "About this demo",
    entries: [
      {
        id: "is-real",
        question: "Is this a real store?",
        answer:
          "No. Stockroom is a frontend demo. Products, prices and stock levels are sample data, and no orders are placed or charged.",
      },
      {
        id: "data-source",
        question: "Where does the product data come from?",
        answer:
          "Product names, descriptions, prices and photos come from the public DummyJSON sample dataset. Size and storage options were added for demonstration.",
      },
      {
        id: "account",
        question: "Do I need an account?",
        answer:
          "No. There is no sign-in. Your cart is saved in this browser only and is cleared if you clear your site data.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Orders and shipping",
    entries: [
      {
        id: "free-shipping",
        question: "When is shipping free?",
        answer: `Standard shipping is free on orders of $${site.freeShippingThreshold} or more. Below that, standard shipping is $${site.standardShipping}. Express is $${site.expressShipping}.`,
      },
      {
        id: "shipping-times",
        question: "How long does delivery take?",
        answer:
          "Each product page lists its own shipping estimate, such as “Ships in 1 week”. Express shipping is shown at checkout for faster delivery.",
      },
      {
        id: "tax",
        question: "How is tax calculated?",
        answer:
          `The cart shows an estimated tax of ${site.estimatedTaxRate * 100}% so you can see a full total. A real store would calculate tax from your shipping address.`,
      },
    ],
  },
  {
    id: "returns",
    title: "Returns and warranty",
    entries: [
      {
        id: "return-window",
        question: "Can I return an item?",
        answer:
          "Return windows vary by product and are listed on each product page, for example “30 days return policy” or “No return policy”.",
      },
      {
        id: "warranty",
        question: "Do products come with a warranty?",
        answer:
          "Warranty terms are listed per product under “Shipping & returns”. Some items have no warranty.",
      },
    ],
  },
];
