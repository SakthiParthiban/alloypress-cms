import CategoryListing from "@/components/category/CategoryListing";

export const metadata = {
  title: "AI Comparisons | AlloyPress",
  description:
    "Side-by-side AI tool comparisons to help you choose the right tool with confidence.",
};

export default function ComparisonsPage() {
  return (
    <CategoryListing
      slug="comparisons"
      title="Comparisons"
      description="Side-by-side AI tool analysis to help you choose confidently."
    />
  );
}