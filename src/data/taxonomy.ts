import type { Category, Department, VariantGroup } from "@/lib/types";

export const departments: Department[] = [
  {
    slug: "electronics",
    label: "Electronics",
    aisle: 1,
    blurb: "Phones, laptops, tablets and the cables that keep them going.",
    categories: ["smartphones", "laptops", "tablets", "mobile-accessories"],
  },
  {
    slug: "home-kitchen",
    label: "Home & kitchen",
    aisle: 2,
    blurb: "Furniture, decor and the tools you reach for every day.",
    categories: ["furniture", "home-decoration", "kitchen-accessories"],
  },
  {
    slug: "fashion",
    label: "Fashion",
    aisle: 3,
    blurb: "Shirts, tops, dresses and shoes.",
    categories: ["mens-shirts", "tops", "womens-dresses", "mens-shoes", "womens-shoes"],
  },
  {
    slug: "accessories",
    label: "Watches & bags",
    aisle: 4,
    blurb: "Watches, bags, jewelry and sunglasses.",
    categories: ["mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses"],
  },
  {
    slug: "beauty",
    label: "Beauty",
    aisle: 5,
    blurb: "Makeup, skin care and fragrance.",
    categories: ["beauty", "skin-care", "fragrances"],
  },
  {
    slug: "sports",
    label: "Sports",
    aisle: 6,
    blurb: "Balls, bats, rackets and gear for the weekend.",
    categories: ["sports-accessories"],
  },
  {
    slug: "groceries",
    label: "Groceries",
    aisle: 7,
    blurb: "Pantry staples, fresh produce and snacks.",
    categories: ["groceries"],
  },
];

const categoryLabels: Record<string, string> = {
  smartphones: "Smartphones",
  laptops: "Laptops",
  tablets: "Tablets",
  "mobile-accessories": "Phone accessories",
  furniture: "Furniture",
  "home-decoration": "Home decor",
  "kitchen-accessories": "Kitchen",
  "mens-shirts": "Men's shirts",
  tops: "Women's tops",
  "womens-dresses": "Dresses",
  "mens-shoes": "Men's shoes",
  "womens-shoes": "Women's shoes",
  "mens-watches": "Men's watches",
  "womens-watches": "Women's watches",
  "womens-bags": "Bags",
  "womens-jewellery": "Jewelry",
  sunglasses: "Sunglasses",
  beauty: "Makeup",
  "skin-care": "Skin care",
  fragrances: "Fragrance",
  "sports-accessories": "Sports gear",
  groceries: "Groceries",
};

export const categories: Category[] = departments.flatMap((d) =>
  d.categories.map((slug) => ({
    slug,
    label: categoryLabels[slug] ?? slug,
    department: d.slug,
  })),
);

/**
 * Mock variant rules. The source dataset has no variants, so these are
 * illustrative options applied per category.
 */
const apparelSizes: VariantGroup = {
  name: "Size",
  options: ["XS", "S", "M", "L", "XL"].map((label) => ({ label, priceDelta: 0 })),
};

const shoeSizes: VariantGroup = {
  name: "Size",
  options: ["6", "7", "8", "9", "10", "11", "12"].map((label) => ({
    label: `US ${label}`,
    priceDelta: 0,
  })),
};

export const variantRules: Record<string, VariantGroup[]> = {
  smartphones: [
    {
      name: "Storage",
      options: [
        { label: "128 GB", priceDelta: 0 },
        { label: "256 GB", priceDelta: 100 },
        { label: "512 GB", priceDelta: 250 },
      ],
    },
  ],
  tablets: [
    {
      name: "Storage",
      options: [
        { label: "64 GB", priceDelta: 0 },
        { label: "128 GB", priceDelta: 60 },
        { label: "256 GB", priceDelta: 150 },
      ],
    },
  ],
  laptops: [
    {
      name: "Memory",
      options: [
        { label: "16 GB", priceDelta: 0 },
        { label: "32 GB", priceDelta: 200 },
      ],
    },
  ],
  "mens-shirts": [apparelSizes],
  tops: [apparelSizes],
  "womens-dresses": [apparelSizes],
  "mens-shoes": [shoeSizes],
  "womens-shoes": [shoeSizes],
};
