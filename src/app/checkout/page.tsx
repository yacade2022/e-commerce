import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout (demo)",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <CheckoutView />
    </div>
  );
}
