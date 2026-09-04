import CategoryListing from "@/components/category/CategoryListing";

export const metadata = {
  title: "AI Tool Reviews | AlloyPress",
  description:
    "Hands-on AI tool reviews based on real testing, real prompts and practical use cases.",
};

export default function ReviewsPage() {
  return (
    <CategoryListing
      slug="reviews"
      title="Reviews"
      description="Hands-on AI tool reviews based on real testing, practical use cases and honest results."
    />
  );
}