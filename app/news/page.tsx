import CategoryListing from "@/components/category/CategoryListing";

export const metadata = {
  title: "AI News | AlloyPress",
  description:
    "The latest AI developments, launches, updates and important stories, explained clearly.",
};

export default function NewsPage() {
  return (
    <CategoryListing
      slug="news"
      title="News"
      description="The latest AI developments, launches and updates — without the noise."
    />
  );
}