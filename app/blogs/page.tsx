import CategoryListing from "@/components/category/CategoryListing";

export const metadata = {
  title: "AI Blogs | AlloyPress",
  description:
    "Practical AI guides, tutorials, explainers and useful knowledge from AlloyPress.",
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