import Hero from "@/components/home/Hero";
import Trending from "@/components/home/Trending";
import CategorySection from "@/components/home/CategorySection";
import AlloyPick from "@/components/home/AlloyPick";
import LearnAboutAI from "@/components/home/LearnAboutAI";
import RecentAINews from "@/components/home/RecentAINews";
import AIToolReviews from "@/components/home/AIToolReviews";
import PopularResources from "@/components/home/PopularResources";
import ToolSubmissionCTA from "@/components/home/ToolSubmissionCTA";
import NewsletterSection from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <Trending />
      <CategorySection />
      <AlloyPick />
      <PopularResources />
      <LearnAboutAI/>
      <RecentAINews />
      <AIToolReviews />
      <NewsletterSection />
      <ToolSubmissionCTA />
    </main>
  );
}