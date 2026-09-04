import CategoryListing from "@/components/category/CategoryListing";

export const metadata = {
  title: "AI Alternatives | AlloyPress",
  description:
    "Find better AI tool alternatives based on features, pricing, use cases and practical testing.",
};

export default function AlternativesPage() {
  return (
    <CategoryListing
      slug="alternatives"
      title="Alternatives"
      description="Find better AI tools when the obvious choice isn't right — compared by real use cases."
    />
  );
}