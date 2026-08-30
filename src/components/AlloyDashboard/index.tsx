import type { ReactNode } from 'react'
import type { AdminViewServerProps } from 'payload'
import { Link } from '@payloadcms/ui'

import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Folder,
  Image,
  Lightbulb,
  Link2,
  PenLine,
  Search,
  Plus,
  Tags,
  TriangleAlert,
  Upload,
  Users,
} from 'lucide-react'

import './index.scss'

type CollectionCardProps = {
  title: string
  description: string
  count: number
  icon: ReactNode
  href: string
}

type QuickActionProps = {
  title: string
  icon: ReactNode
  href: string
}

export default async function AlloyDashboard({
  initPageResult,
}: AdminViewServerProps) {
  const { req } = initPageResult

  const payload = req.payload
  const user = req.user

  // =========================================================
  // AUTH
  // =========================================================

  if (!user) {
    return (
      <main className="alloy-dashboard">
        <div className="alloy-empty">
          <span>You must be logged in to view this dashboard.</span>
        </div>
      </main>
    )
  }

  // =========================================================
  // REAL PAYLOAD COUNTS
  // =========================================================

  const [
    postsCount,
    pagesCount,
    usersCount,
    mediaCount,
    categoriesCount,
    tagsCount,
    notFoundCount,
    redirectsCount,
  ] = await Promise.all([
    payload.count({
      collection: 'posts',
      req,
    }),

    payload.count({
      collection: 'pages',
      req,
    }),

    payload.count({
      collection: 'users',
      req,
    }),

    payload.count({
      collection: 'media',
      req,
    }),

    payload.count({
      collection: 'categories',
      req,
    }),

    payload.count({
      collection: 'tags',
      req,
    }),

    payload.count({
      collection: 'not-found-logs',
      req,
    }),

    payload.count({
      collection: 'redirects',
      req,
    }),
  ])

  // =========================================================
  // RECENT POSTS
  // =========================================================

  const recentPosts = await payload.find({
    collection: 'posts',
    req,
    limit: 3,
    depth: 0,
    sort: '-updatedAt',
  })

  // =========================================================
  // USER NAME
  // =========================================================

  const userName =
    typeof user.displayName === 'string' && user.displayName.trim()
      ? user.displayName
      : 'there'

  // =========================================================
  // DATE
  // =========================================================

  const today = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  const quickActions: QuickActionProps[] = [
    {
      title: 'New Post',
      icon: <FileText />,
      href: '/admin/collections/posts/create',
    },
    {
      title: 'Upload Media',
      icon: <Upload />,
      href: '/admin/collections/media',
    },
    {
      title: 'New Page',
      icon: <BookOpen />,
      href: '/admin/collections/pages/create',
    },
    {
      title: 'New Category',
      icon: <Folder />,
      href: '/admin/collections/categories/create',
    },
  ]

  // =========================================================
  // COLLECTIONS
  // =========================================================

  const collections: CollectionCardProps[] = [
    {
      title: 'Users',
      description: 'Manage all users',
      count: usersCount.totalDocs,
      icon: <Users />,
      href: '/admin/collections/users',
    },

    {
      title: 'Media',
      description: 'Manage media files',
      count: mediaCount.totalDocs,
      icon: <Image />,
      href: '/admin/collections/media',
    },

    {
      title: 'Categories',
      description: 'Organize categories',
      count: categoriesCount.totalDocs,
      icon: <Folder />,
      href: '/admin/collections/categories',
    },

    {
      title: 'Tags',
      description: 'Manage tags',
      count: tagsCount.totalDocs,
      icon: <Tags />,
      href: '/admin/collections/tags',
    },

    {
      title: 'Posts',
      description: 'Manage blog posts',
      count: postsCount.totalDocs,
      icon: <FileText />,
      href: '/admin/collections/posts',
    },

    {
      title: 'Pages',
      description: 'Manage website pages',
      count: pagesCount.totalDocs,
      icon: <BookOpen />,
      href: '/admin/collections/pages',
    },

    {
      title: 'Not Found Logs',
      description: '404 error logs',
      count: notFoundCount.totalDocs,
      icon: <TriangleAlert />,
      href: '/admin/collections/not-found-logs',
    },

    {
      title: 'Redirects',
      description: 'Manage URL redirects',
      count: redirectsCount.totalDocs,
      icon: <Link2 />,
      href: '/admin/collections/redirects',
    },
  ]

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <main className="alloy-dashboard">


      {/* =====================================================
          WELCOME + QUICK ACTIONS
      ===================================================== */}

      <section className="alloy-dashboard__hero">

        <div className="alloy-dashboard__hero-left">

          <h1>
            Welcome back, {userName}!
            <span aria-hidden="true"> 👋</span>
          </h1>

          <p>
            Manage your content and keep your site updated.
          </p>

          <div className="alloy-dashboard__hero-actions">

            <div className="alloy-dashboard__date">
              <CalendarDays
                size={17}
                aria-hidden="true"
              />

              <span>{today}</span>
            </div>

            <Link
              href="/admin/collections/posts/create"
              className="alloy-dashboard__new-content"
            >
              <Plus
                size={17}
                aria-hidden="true"
              />

              <span>New Content</span>
            </Link>

          </div>

        </div>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <div className="alloy-quick-actions">

          <h2>Quick Actions</h2>

          <div className="alloy-quick-actions__grid">

            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="alloy-quick-action"
              >

                <div className="alloy-quick-action__icon">
                  {action.icon}
                </div>

                <span>
                  {action.title}
                </span>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          COLLECTIONS HEADER
      ===================================================== */}

      <section className="alloy-section-header">

        <div>
          <h2>Collections</h2>

          <p>
            Manage your AlloyPress content and resources.
          </p>
        </div>

        <Link
          href="/admin/collections/posts"
          className="alloy-section-header__link"
        >
          <span>View all</span>

          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </Link>

      </section>


      {/* =====================================================
          COLLECTIONS
      ===================================================== */}

      <section
        className="alloy-collections"
        aria-label="Collections"
      >

        {collections.map((collection) => (
          <Link
            href={collection.href}
            key={collection.title}
            className="alloy-collection-card"
          >

            <div className="alloy-collection-card__icon">
              {collection.icon}
            </div>

            <div className="alloy-collection-card__content">

              <h3>
                {collection.title}
              </h3>

              <p>
                {collection.description}
              </p>

              <span className="alloy-collection-card__count">
                {collection.count.toLocaleString()}
              </span>

            </div>

            <div className="alloy-collection-card__arrow">

              <ChevronRight
                size={19}
                aria-hidden="true"
              />

            </div>

          </Link>
        ))}

      </section>


      {/* =====================================================
          BOTTOM CONTENT
      ===================================================== */}

      <section className="alloy-dashboard__bottom">


        {/* ===================================================
            RECENT ACTIVITY
        =================================================== */}

        <div className="alloy-panel">

          <div className="alloy-panel__header">

            <div>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest content updates
              </p>

            </div>

            <Link href="/admin/collections/posts">
              <span>View all</span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />
            </Link>

          </div>


          <div className="alloy-activity">

            {recentPosts.docs.length === 0 ? (

              <div className="alloy-empty">

                <FileText
                  size={22}
                  aria-hidden="true"
                />

                <span>
                  No posts available yet.
                </span>

              </div>

            ) : (

              recentPosts.docs.map((post) => {

                const title =
                  typeof post.title === 'string'
                    ? post.title
                    : 'Untitled post'

                const updatedAt = post.updatedAt
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(post.updatedAt))
                  : 'Recently'

                return (
                  <Link
                    href={`/admin/collections/posts/${post.id}`}
                    key={post.id}
                    className="alloy-activity__item"
                  >

                    <div className="alloy-activity__icon">

                      <PenLine
                        size={18}
                        aria-hidden="true"
                      />

                    </div>

                    <div className="alloy-activity__content">

                      <strong>
                        {title}
                      </strong>

                      <span>
                        Post updated
                      </span>

                    </div>

                    <time>
                      {updatedAt}
                    </time>

                    <span
                      className="alloy-activity__dot"
                      aria-hidden="true"
                    />

                  </Link>
                )
              })

            )}

          </div>


          {recentPosts.docs.length > 0 && (
            <div className="alloy-panel__footer">

              <Link href="/admin/collections/posts">
                <span>View all activity</span>

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>

            </div>
          )}

        </div>


        {/* ===================================================
            QUICK TIPS
        =================================================== */}

        <div className="alloy-panel alloy-panel--tips">

          <div className="alloy-panel__header">

            <div>

              <h2>
                Quick Tips
              </h2>

              <p>
                Get more from AlloyPress
              </p>

            </div>

            <Lightbulb
              size={21}
              aria-hidden="true"
            />

          </div>


          <div className="alloy-tip">

            <div className="alloy-tip__icon">

              <Lightbulb
                size={38}
                aria-hidden="true"
              />

            </div>

            <div>

              <h3>
                Keep your content organized
              </h3>

              <p>
                Use collections, categories and tags
                to keep your website content structured
                and easy to manage.
              </p>

              <Link href="/admin/collections/posts">

                <span>
                  Explore content
                </span>

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="alloy-dashboard__footer">

        <span>
          © {new Date().getFullYear()} AlloyPress. All rights reserved.
        </span>

        <span>
          Payload CMS V3.0.0
        </span>

      </footer>

    </main>
  )
}