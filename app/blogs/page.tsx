import CategoryListing from "@/components/category/CategoryListing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Blogs | AlloyPress",
  description:
    "Practical AI guides, tutorials, explainers and useful knowledge from AlloyPress.",

  alternates: {
    canonical: "https://alloypress.com/blogs",
  },
};

export default function BlogsPage() {
  return (
    <CategoryListing
      slug="blogs"
      title="Blogs"
      description="Practical guides, tutorials and useful AI knowledge — tested, explained and simplified."
    />
  );
}