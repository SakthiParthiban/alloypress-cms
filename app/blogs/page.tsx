import CategoryListing from "@/components/category/CategoryListing";

import {
  buildPageMetadata,
} from "@/lib/seo/metadata";

import {
  CATEGORY_PATHS,
  SITE_URL,
} from "@/lib/seo/constants";

import {
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createOrganizationSchema,
} from "@/lib/seo/schema";

export const metadata = buildPageMetadata({
  title: "AI Blogs | AlloyPress",

  description:
    "Practical AI guides, tutorials, explainers and useful knowledge from AlloyPress.",

  canonicalPath:
    CATEGORY_PATHS.blogs,
});

export default function BlogsPage() {
  const pageUrl =
    `${SITE_URL}${CATEGORY_PATHS.blogs}`;

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      createOrganizationSchema(),

      createCollectionPageSchema({
        url: pageUrl,

        name: "AI Blogs | AlloyPress",

        description:
          "Practical AI guides, tutorials, explainers and useful knowledge from AlloyPress.",
      }),

      createBreadcrumbSchema([
        {
          name: "Home",
          url: SITE_URL,
        },

        {
          name: "Blogs",
          url: pageUrl,
        },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd,
          ),
        }}
      />

      <CategoryListing
        slug="blogs"
        title="Blogs"
        description="Practical guides, tutorials and useful AI knowledge — tested, explained and simplified."
      />
    </>
  );
}