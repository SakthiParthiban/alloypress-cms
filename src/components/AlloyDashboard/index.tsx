'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useAuth, useTheme } from '@payloadcms/ui'

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  FileText,
  Folder,
  Image as ImageIcon,
  Lightbulb,
  Moon,
  PenLine,
  Plus,
  Sun,
  Tags,
  Upload,
  Users,
  BarChart3,
  Clock3,
  FileClock,
  Send,
} from 'lucide-react'

import './index.scss'

/* =========================================================
   TYPES
   ========================================================= */

type Accent =
  | 'purple'
  | 'green'
  | 'orange'
  | 'blue'
  | 'red'

type SparklinePoint = {
  x: number
  y: number
}

type CollectionCardProps = {
  title: string
  description: string
  count: number
  icon: ReactNode
  href: string
  accent: Accent
  sparkline: SparklinePoint[]
}

type QuickActionProps = {
  title: string
  icon: ReactNode
  href: string
  accent: Accent
}

type RecentPost = {
  id: string | number
  title?: string
  updatedAt?: string
}

type EditorStats = {
  publishedThisWeek: number
  publishedThisMonth: number
  updatedThisWeek: number
  updatedThisMonth: number
  draftPosts: number
  scheduledPosts: number
}

type DashboardData = {
  posts: number
  pages: number
  users: number
  media: number
  categories: number
  tags: number
  notFoundLogs: number
  redirects: number
  recentPosts: RecentPost[]
  editorStats: EditorStats
}

type WhereClause = Record<string, unknown>

type EditorFilterKey =
  | 'publishedThisWeek'
  | 'publishedThisMonth'
  | 'updatedThisWeek'
  | 'updatedThisMonth'
  | 'draftPosts'
  | 'scheduledPosts'

type EditorFilterMap = Record<
  EditorFilterKey,
  WhereClause
>

/* =========================================================
   EMPTY DATA
   ========================================================= */

const EMPTY_EDITOR_STATS: EditorStats = {
  publishedThisWeek: 0,
  publishedThisMonth: 0,
  updatedThisWeek: 0,
  updatedThisMonth: 0,
  draftPosts: 0,
  scheduledPosts: 0,
}

const EMPTY_DATA: DashboardData = {
  posts: 0,
  pages: 0,
  users: 0,
  media: 0,
  categories: 0,
  tags: 0,
  notFoundLogs: 0,
  redirects: 0,
  recentPosts: [],
  editorStats: EMPTY_EDITOR_STATS,
}

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

const getTotalDocs = (value: unknown): number => {
  if (!value || typeof value !== 'object') {
    return 0
  }

  const totalDocs = (
    value as {
      totalDocs?: unknown
    }
  ).totalDocs

  return typeof totalDocs === 'number' &&
    Number.isFinite(totalDocs)
    ? totalDocs
    : 0
}

const getRecentPosts = (
  value: unknown,
): RecentPost[] => {
  if (!value || typeof value !== 'object') {
    return []
  }

  const docs = (
    value as {
      docs?: unknown
    }
  ).docs

  if (!Array.isArray(docs)) {
    return []
  }

  return docs
    .filter(
      (
        doc,
      ): doc is Record<string, unknown> =>
        Boolean(
          doc &&
          typeof doc === 'object',
        ),
    )
    .map((doc, index) => ({
      id:
        typeof doc.id === 'string' ||
          typeof doc.id === 'number'
          ? doc.id
          : `recent-${index}`,

      title:
        typeof doc.title === 'string'
          ? doc.title
          : undefined,

      updatedAt:
        typeof doc.updatedAt === 'string'
          ? doc.updatedAt
          : undefined,
    }))
}

const getDisplayName = (
  value: unknown,
): string => {
  if (!value || typeof value !== 'object') {
    return 'there'
  }

  const record = value as {
    displayName?: unknown
    name?: unknown
    email?: unknown
  }

  if (
    typeof record.displayName === 'string' &&
    record.displayName.trim()
  ) {
    return record.displayName.trim()
  }

  if (
    typeof record.name === 'string' &&
    record.name.trim()
  ) {
    return record.name.trim()
  }

  if (
    typeof record.email === 'string' &&
    record.email.includes('@')
  ) {
    const emailName = record.email.split('@')[0]

    return emailName
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return 'there'
}

/* =========================================================
   DATE RANGES
   ========================================================= */

const getDateRanges = () => {
  const now = new Date()

  /*
   * Monday is the beginning of the editorial week.
   */
  const weekStart = new Date(now)

  const day = weekStart.getDay()

  const daysFromMonday =
    day === 0 ? 6 : day - 1
  weekStart.setDate(
    weekStart.getDate() -
    daysFromMonday,
  )

  weekStart.setHours(
    0,
    0,
    0,
    0,
  )

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  )

  monthStart.setHours(
    0,
    0,
    0,
    0,
  )

  return {
    now: now.toISOString(),
    weekStart:
      weekStart.toISOString(),
    monthStart:
      monthStart.toISOString(),
  }
}

/* =========================================================
   PAYLOAD API
   ========================================================= */

const fetchCollectionCount = async (
  slug: string,
  query = '',
): Promise<number> => {
  const response = await fetch(
    `/api/${slug}?limit=1&depth=0${query}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load ${slug}`,
    )
  }

  const json = await response.json()

  return getTotalDocs(json)
}

/* =========================================================
   PAYLOAD WHERE SERIALIZER
   =========================================================

   One serializer is used everywhere.

   This is important because the exact same Payload
   `where` object is used for:

   1. Dashboard count
   2. Posts collection URL

   Therefore the number shown on the card and the
   records shown after clicking cannot use different
   filters.
   ========================================================= */

const serializeWhere = (
  where: WhereClause,
): string => {
  const pairs: string[] = []

  const walk = (
    value: unknown,
    path: string,
  ) => {
    if (Array.isArray(value)) {
      value.forEach(
        (item, index) => {
          walk(
            item,
            `${path}[${index}]`,
          )
        },
      )

      return
    }

    if (
      value &&
      typeof value === 'object'
    ) {
      Object.entries(
        value as Record<
          string,
          unknown
        >,
      ).forEach(
        ([key, val]) => {
          walk(
            val,
            `${path}[${key}]`,
          )
        },
      )

      return
    }

    if (value !== undefined) {
      pairs.push(
        `${path}=${encodeURIComponent(
          String(value),
        )}`,
      )
    }
  }

  walk(where, 'where')

  return pairs.join('&')
}

/* =========================================================
   EDITOR FILTERS
   =========================================================

   BUSINESS RULES

   Published This Week
   -> _status = published
   -> publishedAt >= Monday
   -> publishedAt <= now

   Published This Month
   -> _status = published
   -> publishedAt >= month start
   -> publishedAt <= now

   Updated This Week
   -> migrated post:
      legacy.wordpressModifiedAt

   -> native Payload post:
      updatedAt fallback

   Updated This Month
   -> same logic as above

   Draft Posts
   -> draft status
   -> draft workflow
   -> not scheduled

   Scheduled Posts
   -> draft status
   -> draft workflow
   -> future publishedAt
   ========================================================= */

const buildEditorFilters = (
  ranges: {
    now: string
    weekStart: string
    monthStart: string
  },
): EditorFilterMap => {
  const publishedFilter = (
    start: string,
  ): WhereClause => ({
    and: [
      {
        _status: {
          equals: 'published',
        },
      },
      {
        publishedAt: {
          greater_than_equal:
            start,
        },
      },
      {
        publishedAt: {
          less_than_equal:
            ranges.now,
        },
      },
    ],
  })

  /*
   * Migrated posts have their original WordPress
   * modified date stored in:
   *
   * legacy.wordpressModifiedAt
   *
   * New posts created directly in Payload don't have
   * that historical field, so updatedAt is used.
   */
  const updatedFilter = (
    start: string,
  ): WhereClause => ({
    or: [
      {
        and: [
          {
            'legacy.wordpressModifiedAt':
            {
              exists: true,
            },
          },
          {
            'legacy.wordpressModifiedAt':
            {
              greater_than_equal:
                start,
            },
          },
          {
            'legacy.wordpressModifiedAt':
            {
              less_than_equal:
                ranges.now,
            },
          },
        ],
      },
      {
        and: [
          {
            'legacy.wordpressModifiedAt':
            {
              exists: false,
            },
          },
          {
            updatedAt: {
              greater_than_equal:
                start,
            },
          },
          {
            updatedAt: {
              less_than_equal:
                ranges.now,
            },
          },
        ],
      },
    ],
  })

  return {
    publishedThisWeek:
      publishedFilter(
        ranges.weekStart,
      ),

    publishedThisMonth:
      publishedFilter(
        ranges.monthStart,
      ),

    updatedThisWeek:
      updatedFilter(
        ranges.weekStart,
      ),

    updatedThisMonth:
      updatedFilter(
        ranges.monthStart,
      ),

    /*
     * Drafts must exclude scheduled posts.
     */
    draftPosts: {
      and: [
        {
          _status: {
            equals: 'draft',
          },
        },
        {
          workflowStatus: {
            equals: 'draft',
          },
        },
        {
          or: [
            {
              publishedAt: {
                exists: false,
              },
            },
            {
              publishedAt: {
                less_than_equal:
                  ranges.now,
              },
            },
          ],
        },
      ],
    },

    /*
     * Scheduled posts are drafts with a future
     * publication date.
     */
    scheduledPosts: {
      and: [
        {
          _status: {
            equals: 'draft',
          },
        },
        {
          workflowStatus: {
            equals: 'draft',
          },
        },
        {
          publishedAt: {
            greater_than:
              ranges.now,
          },
        },
      ],
    },
  }
}

/* =========================================================
   EDITOR STAT URL
   ========================================================= */

const buildEditorPostUrl = (
  where: WhereClause,
): string => {
  const query = serializeWhere(where)

  return query
    ? `/admin/collections/posts?${query}`
    : '/admin/collections/posts'
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AlloyDashboard() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  // Payload auth context: undefined means auth is still resolving.
  const authResolved = user !== undefined
  const userRole = typeof user?.role === 'string' ? user.role : null
  const isEditor = userRole === 'editor'
  const isAdmin = userRole === 'admin'
  const displayName = getDisplayName(user)

  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [today, setToday] = useState('')
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [activeTip, setActiveTip] = useState(0)
  const [pauseTips, setPauseTips] = useState(false)

  const [editorStatUrls, setEditorStatUrls] = useState<Record<EditorFilterKey, string>>({
    publishedThisWeek: '/admin/collections/posts',
    publishedThisMonth: '/admin/collections/posts',
    updatedThisWeek: '/admin/collections/posts',
    updatedThisMonth: '/admin/collections/posts',
    draftPosts: '/admin/collections/posts',
    scheduledPosts: '/admin/collections/posts',
  })

  useEffect(() => {
    if (!authResolved || !user || !userRole) return

    let cancelled = false

    const loadDashboard = async () => {
      setLoading(true)
      setLoadError(false)

      try {
        const ranges = getDateRanges()

        const baseSlugs =
          userRole === 'editor'
            ? ['posts', 'pages', 'media', 'categories', 'tags']
            : ['posts', 'pages', 'users', 'media', 'categories', 'tags', 'not-found-logs', 'redirects']

        const collectionPromise = Promise.all(
          baseSlugs.map(async (slug) => {
            const count = await fetchCollectionCount(slug)
            return [slug, count] as const
          }),
        )

        const recentPostsPromise = fetch(
          '/api/posts?limit=3&depth=0&sort=-updatedAt',
          {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { Accept: 'application/json' },
          },
        )

        let editorStatsPromise: Promise<EditorStats> = Promise.resolve(EMPTY_EDITOR_STATS)

        if (userRole === 'editor' || userRole === 'admin') {
          const filters = buildEditorFilters(ranges)
          const filterEntries = Object.entries(filters) as [EditorFilterKey, WhereClause][]

          const urls = Object.fromEntries(
            filterEntries.map(([key, where]) => [key, buildEditorPostUrl(where)]),
          ) as Record<EditorFilterKey, string>

          if (!cancelled) setEditorStatUrls(urls)

          editorStatsPromise = Promise.all(
            filterEntries.map(([, where]) =>
              fetchCollectionCount('posts', `&${serializeWhere(where)}`),
            ),
          ).then((counts) =>
            filterEntries.reduce(
              (acc, [key], index) => {
                acc[key] = counts[index] ?? 0
                return acc
              },
              { ...EMPTY_EDITOR_STATS } as EditorStats,
            ),
          )
        }

        const [collectionResults, recentPostsResponse, editorStats] = await Promise.all([
          collectionPromise,
          recentPostsPromise,
          editorStatsPromise,
        ])

        if (!recentPostsResponse.ok) {
          throw new Error('Failed to load recent posts')
        }

        const recentPostsJson = await recentPostsResponse.json()
        if (cancelled) return

        const counts = Object.fromEntries(collectionResults) as Record<string, number>

        setData({
          posts: counts.posts ?? 0,
          pages: counts.pages ?? 0,
          users: counts.users ?? 0,
          media: counts.media ?? 0,
          categories: counts.categories ?? 0,
          tags: counts.tags ?? 0,
          notFoundLogs: counts['not-found-logs'] ?? 0,
          redirects: counts.redirects ?? 0,
          recentPosts: getRecentPosts(recentPostsJson),
          editorStats,
        })
      } catch (error) {
        console.error('Failed to load AlloyPress dashboard:', error)
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [authResolved, user, userRole])

  useEffect(() => {
    const now = new Date()
    setToday(new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(now))
    setCurrentYear(now.getFullYear())
  }, [])

  /* =========================================================
     QUICK TIPS
     ========================================================= */

  const quickTips = useMemo(
    () => {
      if (isEditor) {
        return [
          {
            key: 'posts',
            title: 'Posts',
            eyebrow: 'Publishing',
            description:
              'Keep your editorial workflow organized and review recently updated articles before publishing.',
            href:
              '/admin/collections/posts',
            count: data.posts,
            icon: <PenLine />,
            accent:
              'green' as Accent,
          },

          {
            key: 'media',
            title: 'Media',
            eyebrow: 'Asset Library',
            description:
              'Keep images and uploaded files easy to find so editors can reuse the right assets quickly.',
            href:
              '/admin/collections/media',
            count: data.media,
            icon: <ImageIcon />,
            accent:
              'purple' as Accent,
          },

          {
            key: 'categories',
            title: 'Categories',
            eyebrow: 'Organization',
            description:
              'Keep posts organized with clear categories and make your editorial workflow easier to manage.',
            href:
              '/admin/collections/categories',
            count: data.categories,
            icon: <Folder />,
            accent:
              'orange' as Accent,
          },
        ]
      }

      return [
        {
          key: 'posts',
          title: 'Posts',
          eyebrow: 'Publishing',
          description:
            'Keep your editorial workflow organized and review recently updated articles before publishing.',
          href:
            '/admin/collections/posts',
          count: data.posts,
          icon: <PenLine />,
          accent:
            'green' as Accent,
        },

        {
          key: 'media',
          title: 'Media',
          eyebrow: 'Asset Library',
          description:
            'Keep images and uploaded files easy to find so editors can reuse the right assets quickly.',
          href:
            '/admin/collections/media',
          count: data.media,
          icon: <ImageIcon />,
          accent:
            'purple' as Accent,
        },

        {
          key: 'users',
          title: 'Users',
          eyebrow: 'Access Control',
          description:
            'Review your team accounts and make sure the right people have access to the admin workspace.',
          href:
            '/admin/collections/users',
          count: data.users,
          icon: <Users />,
          accent:
            'blue' as Accent,
        },
      ]
    },
    [
      isEditor,
      data.posts,
      data.media,
      data.categories,
      data.users,
    ],
  )

  /* =========================================================
     QUICK TIP AUTO ROTATION
     ========================================================= */

  useEffect(() => {
    if (
      quickTips.length < 2 ||
      pauseTips
    ) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          setActiveTip(
            (current) =>
              (current + 1) %
              quickTips.length,
          )
        },
        6500,
      )

    return () =>
      window.clearInterval(
        timer,
      )
  }, [
    pauseTips,
    quickTips.length,
  ])

  useEffect(() => {
    if (
      activeTip >=
      quickTips.length
    ) {
      setActiveTip(0)
    }
  }, [
    activeTip,
    quickTips.length,
  ])

  /* =========================================================
     QUICK ACTIONS
     ========================================================= */

  const quickActions:
    QuickActionProps[] = [
      {
        title: 'New Post',
        icon: <FilePlus2 />,
        href:
          '/admin/collections/posts/create',
        accent: 'green',
      },

      {
        title: 'Upload Media',
        icon: <Upload />,
        href:
          '/admin/collections/media',
        accent: 'purple',
      },

      {
        title: 'New Page',
        icon: <FileText />,
        href:
          '/admin/collections/pages/create',
        accent: 'blue',
      },

      {
        title: 'New Category',
        icon: <Folder />,
        href:
          '/admin/collections/categories/create',
        accent: 'orange',
      },
    ]

  /* =========================================================
     ADMIN COLLECTIONS
     ========================================================= */

  const adminCollections:
    CollectionCardProps[] = [
      {
        title: 'Users',
        description:
          'Manage all users',
        count: data.users,
        icon: <Users />,
        href:
          '/admin/collections/users',
        accent: 'purple',
        sparkline: [
          { x: 0, y: 24 },
          { x: 18, y: 20 },
          { x: 35, y: 22 },
          { x: 52, y: 12 },
          { x: 70, y: 17 },
          { x: 88, y: 8 },
          { x: 108, y: 14 },
          { x: 128, y: 5 },
        ],
      },

      {
        title: 'Media',
        description:
          'Manage media files',
        count: data.media,
        icon: <ImageIcon />,
        href:
          '/admin/collections/media',
        accent: 'green',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 16 },
          { x: 36, y: 20 },
          { x: 54, y: 9 },
          { x: 72, y: 14 },
          { x: 90, y: 6 },
          { x: 108, y: 15 },
          { x: 128, y: 4 },
        ],
      },

      {
        title: 'Categories',
        description:
          'Organize categories',
        count: data.categories,
        icon: <Folder />,
        href:
          '/admin/collections/categories',
        accent: 'orange',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 20 },
          { x: 36, y: 16 },
          { x: 54, y: 20 },
          { x: 72, y: 11 },
          { x: 90, y: 15 },
          { x: 108, y: 5 },
          { x: 128, y: 10 },
        ],
      },

      {
        title: 'Tags',
        description:
          'Manage tags',
        count: data.tags,
        icon: <Tags />,
        href:
          '/admin/collections/tags',
        accent: 'blue',
        sparkline: [
          { x: 0, y: 21 },
          { x: 18, y: 18 },
          { x: 36, y: 22 },
          { x: 54, y: 11 },
          { x: 72, y: 15 },
          { x: 90, y: 7 },
          { x: 108, y: 11 },
          { x: 128, y: 4 },
        ],
      },

      {
        title: 'Posts',
        description:
          'Manage blog posts',
        count: data.posts,
        icon: <FileText />,
        href:
          '/admin/collections/posts',
        accent: 'green',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 17 },
          { x: 36, y: 19 },
          { x: 54, y: 12 },
          { x: 72, y: 16 },
          { x: 90, y: 6 },
          { x: 108, y: 12 },
          { x: 128, y: 3 },
        ],
      },

      {
        title: 'Pages',
        description:
          'Manage website pages',
        count: data.pages,
        icon: <BookOpen />,
        href:
          '/admin/collections/pages',
        accent: 'blue',
        sparkline: [
          { x: 0, y: 21 },
          { x: 18, y: 18 },
          { x: 36, y: 20 },
          { x: 54, y: 12 },
          { x: 72, y: 15 },
          { x: 90, y: 8 },
          { x: 108, y: 12 },
          { x: 128, y: 4 },
        ],
      },

      {
        title: 'Not Found Logs',
        description:
          '404 error logs',
        count:
          data.notFoundLogs,
        icon: (
          <AlertTriangleIcon />
        ),
        href:
          '/admin/collections/not-found-logs',
        accent: 'red',
        sparkline: [
          { x: 0, y: 21 },
          { x: 18, y: 18 },
          { x: 36, y: 22 },
          { x: 54, y: 10 },
          { x: 72, y: 16 },
          { x: 90, y: 7 },
          { x: 108, y: 13 },
          { x: 128, y: 3 },
        ],
      },

      {
        title: 'Redirects',
        description:
          'Manage URL redirects',
        count: data.redirects,
        icon: <Send />,
        href:
          '/admin/collections/redirects',
        accent: 'purple',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 16 },
          { x: 36, y: 20 },
          { x: 54, y: 9 },
          { x: 72, y: 15 },
          { x: 90, y: 6 },
          { x: 108, y: 12 },
          { x: 128, y: 4 },
        ],
      },
    ]

  /* =========================================================
     EDITOR COLLECTIONS
     ========================================================= */

  const editorCollections:
    CollectionCardProps[] = [
      {
        title: 'Media',
        description:
          'Manage media files',
        count: data.media,
        icon: <ImageIcon />,
        href:
          '/admin/collections/media',
        accent: 'green',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 16 },
          { x: 36, y: 20 },
          { x: 54, y: 9 },
          { x: 72, y: 14 },
          { x: 90, y: 6 },
          { x: 108, y: 15 },
          { x: 128, y: 4 },
        ],
      },

      {
        title: 'Categories',
        description:
          'Organize categories',
        count: data.categories,
        icon: <Folder />,
        href:
          '/admin/collections/categories',
        accent: 'orange',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 20 },
          { x: 36, y: 16 },
          { x: 54, y: 20 },
          { x: 72, y: 11 },
          { x: 90, y: 15 },
          { x: 108, y: 5 },
          { x: 128, y: 10 },
        ],
      },

      {
        title: 'Tags',
        description:
          'Manage tags',
        count: data.tags,
        icon: <Tags />,
        href:
          '/admin/collections/tags',
        accent: 'blue',
        sparkline: [
          { x: 0, y: 21 },
          { x: 18, y: 18 },
          { x: 36, y: 22 },
          { x: 54, y: 11 },
          { x: 72, y: 15 },
          { x: 90, y: 7 },
          { x: 108, y: 11 },
          { x: 128, y: 4 },
        ],
      },

      {
        title: 'Posts',
        description:
          'Manage blog posts',
        count: data.posts,
        icon: <FileText />,
        href:
          '/admin/collections/posts',
        accent: 'green',
        sparkline: [
          { x: 0, y: 22 },
          { x: 18, y: 17 },
          { x: 36, y: 19 },
          { x: 54, y: 12 },
          { x: 72, y: 16 },
          { x: 90, y: 6 },
          { x: 108, y: 12 },
          { x: 128, y: 3 },
        ],
      },

      {
        title: 'Pages',
        description:
          'Manage website pages',
        count: data.pages,
        icon: <BookOpen />,
        href:
          '/admin/collections/pages',
        accent: 'blue',
        sparkline: [
          { x: 0, y: 21 },
          { x: 18, y: 18 },
          { x: 36, y: 20 },
          { x: 54, y: 12 },
          { x: 72, y: 15 },
          { x: 90, y: 8 },
          { x: 108, y: 12 },
          { x: 128, y: 4 },
        ],
      },
    ]

  /* =========================================================
     EDITOR PRODUCTIVITY STATS
     ========================================================= */

  const editorStatCards = [
    {
      title: 'Published This Week',
      description:
        'Posts published since Monday',
      value:
        data.editorStats
          .publishedThisWeek,
      icon: <Send />,
      accent:
        'green' as Accent,
      href:
        editorStatUrls.publishedThisWeek,
    },

    {
      title: 'Published This Month',
      description:
        'Posts published this month',
      value:
        data.editorStats
          .publishedThisMonth,
      icon: <BarChart3 />,
      accent:
        'purple' as Accent,
      href:
        editorStatUrls.publishedThisMonth,
    },

    {
      title: 'Updated This Week',
      description:
        'Posts updated since Monday',
      value:
        data.editorStats
          .updatedThisWeek,
      icon: <PenLine />,
      accent:
        'blue' as Accent,
      href:
        editorStatUrls.updatedThisWeek,
    },

    {
      title: 'Updated This Month',
      description:
        'Posts updated this month',
      value:
        data.editorStats
          .updatedThisMonth,
      icon: <Clock3 />,
      accent:
        'orange' as Accent,
      href:
        editorStatUrls.updatedThisMonth,
    },

    {
      title: 'Draft Posts',
      description:
        'Posts currently in draft',
      value:
        data.editorStats
          .draftPosts,
      icon: <FileClock />,
      accent:
        'red' as Accent,
      href:
        editorStatUrls.draftPosts,
    },

    {
      title: 'Scheduled Posts',
      description:
        'Posts waiting for publication',
      value:
        data.editorStats
          .scheduledPosts,
      icon: <CalendarDays />,
      accent:
        'purple' as Accent,
      href:
        editorStatUrls.scheduledPosts,
    },
  ]

  const collections =
    isEditor
      ? editorCollections
      : adminCollections

  /* =========================================================
     CAROUSEL CONTROLS
     ========================================================= */

  const goToTip = (
    index: number,
  ) => {
    setActiveTip(
      (index +
        quickTips.length) %
      quickTips.length,
    )
  }

  const nextTip = () => {
    setActiveTip(
      (current) =>
        (current + 1) %
        quickTips.length,
    )
  }

  const previousTip = () => {
    setActiveTip(
      (current) =>
        (current -
          1 +
          quickTips.length) %
        quickTips.length,
    )
  }

  /* =========================================================
     RENDER
     ========================================================= */

  // Keep a stable shell while Payload auth is resolving. Never return null:
  // doing so creates the large white gap during refresh/layout hydration.
  if (!authResolved) {
    return (
      <main className="alloy-dashboard alloy-dashboard--loading" aria-busy="true">
        <div className="alloy-dashboard__loading-shell">
          <div className="alloy-dashboard__loading-line alloy-dashboard__loading-line--wide" />
          <div className="alloy-dashboard__loading-line alloy-dashboard__loading-line--medium" />
          <div className="alloy-dashboard__loading-block" />
        </div>
      </main>
    )
  }

  // Never guess admin when the role is missing or invalid.
  if (!user || !userRole || (!isAdmin && !isEditor)) {
    return (
      <main className="alloy-dashboard">
        <section className="alloy-dashboard__error" role="alert">
          <h1>Unable to load dashboard</h1>
          <p>Your AlloyPress account does not have a valid dashboard role.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="alloy-dashboard">

      {/* =====================================================
          TOPBAR
          ===================================================== */}

      <header className="alloy-dashboard__topbar">

        <div className="alloy-dashboard__topbar-copy">

          <span className="alloy-dashboard__topbar-dot" />

          <span>
            AlloyPress
          </span>

          <span className="alloy-dashboard__topbar-separator">
            /
          </span>

          <strong>
            Dashboard
          </strong>

        </div>

        <button
          type="button"
          className="alloy-theme-toggle"
          aria-label="Toggle Payload theme"
          title="Toggle Payload theme"
          onClick={() => {
            setTheme(
              theme === 'light'
                ? 'dark'
                : 'light',
            )
          }}
        >
          <span className="alloy-theme-toggle__icon alloy-theme-toggle__icon--sun">
            <Sun
              size={14}
              aria-hidden="true"
            />
          </span>

          <span
            className="alloy-theme-toggle__track"
            aria-hidden="true"
          >
            <span className="alloy-theme-toggle__thumb">
              <Moon size={10} />
            </span>
          </span>

          <span className="alloy-theme-toggle__label">
            Theme
          </span>
        </button>

      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="alloy-dashboard__hero">

        <div className="alloy-dashboard__hero-left">

          <div className="alloy-dashboard__eyebrow">
            <span className="alloy-dashboard__eyebrow-dot" />

            AlloyPress Control Center
          </div>

          <h1>
            Welcome back, {displayName}!

            <span aria-hidden="true">
              {' '}👋
            </span>
          </h1>

          <p>
            {isEditor
              ? 'Keep your editorial workflow moving.'
              : 'Manage your content and keep your site updated.'}
          </p>

          <div className="alloy-dashboard__hero-actions">

            <div className="alloy-dashboard__date">
              <CalendarDays
                size={17}
                aria-hidden="true"
              />

              <span>
                {today || '—'}
              </span>
            </div>

            <Link
              href="/admin/collections/posts/create"
              className="alloy-dashboard__new-content"
            >
              <Plus
                size={17}
                aria-hidden="true"
              />

              <span>
                New Content
              </span>

              <ChevronRight
                size={15}
                aria-hidden="true"
              />
            </Link>

          </div>

          {loadError && (
            <div
              className="alloy-dashboard__status"
              role="status"
            >
              <span>
                Some dashboard data could not be loaded.
              </span>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Refresh
              </button>
            </div>
          )}

        </div>

        {/* ===================================================
            QUICK ACTIONS
            =================================================== */}

        <div className="alloy-quick-actions">

          <div className="alloy-quick-actions__heading">

            <span className="alloy-section-kicker">
              ⚡
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>

          <div className="alloy-quick-actions__grid">

            {quickActions.map(
              (action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`alloy-quick-action alloy-accent--${action.accent}`}
                >
                  <div className="alloy-quick-action__icon">
                    {action.icon}
                  </div>

                  <span>
                    {action.title}
                  </span>
                </Link>
              ),
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT PERFORMANCE
          ===================================================== */}

      {(isEditor || isAdmin) && (
        <>
          <section className="alloy-section-header">

            <div className="alloy-section-header__title">

              <div className="alloy-section-header__title-row">

                <span className="alloy-section-header__symbol">
                  ◈
                </span>

                <h2>
                  Content Performance
                </h2>

              </div>

              <p>
                Track your publishing and editorial activity.
              </p>

            </div>

            <Link
              href="/admin/collections/posts"
              className="alloy-section-header__link"
            >
              <span>
                View posts
              </span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

          </section>

          <section
            className="alloy-editor-stats"
            aria-label="Content performance statistics"
          >
            {editorStatCards.map(
              (stat) => (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className={`alloy-editor-stat alloy-accent--${stat.accent}`}
                >
                  <div className="alloy-editor-stat__top">

                    <div className="alloy-editor-stat__icon">
                      {stat.icon}
                    </div>

                    <span className="alloy-editor-stat__arrow">
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                      />
                    </span>

                  </div>

                  <div className="alloy-editor-stat__content">

                    <span className="alloy-editor-stat__title">
                      {stat.title}
                    </span>

                    <strong>
                      {loading
                        ? '—'
                        : stat.value.toLocaleString()}
                    </strong>

                    <span className="alloy-editor-stat__description">
                      {stat.description}
                    </span>

                  </div>
                </Link>
              ),
            )}
          </section>
        </>
      )}

      {/* =====================================================
          COLLECTION HEADER
          ===================================================== */}

      <section className="alloy-section-header">

        <div className="alloy-section-header__title">

          <div className="alloy-section-header__title-row">

            <span className="alloy-section-header__symbol">
              ◈
            </span>

            <h2>
              Collections
            </h2>

          </div>

          <p>
            {isEditor
              ? 'Manage your editorial content and resources.'
              : 'Manage your AlloyPress content and resources.'}
          </p>

        </div>

        <Link
          href="/admin/collections/posts"
          className="alloy-section-header__link"
        >
          <span>
            View all
          </span>

          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </Link>

      </section>

      {/* =====================================================
          COLLECTION CARDS
          ===================================================== */}

      <section
        className="alloy-collections"
        aria-label="Collections"
      >
        {collections.map(
          (collection) => (
            <Link
              href={collection.href}
              key={collection.title}
              className={`alloy-collection-card alloy-accent--${collection.accent}`}
            >
              <div className="alloy-collection-card__top">

                <div className="alloy-collection-card__identity">

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

                  </div>

                </div>

                <div className="alloy-collection-card__arrow">
                  <ChevronRight
                    size={18}
                    aria-hidden="true"
                  />
                </div>

              </div>

              <div className="alloy-collection-card__bottom">

                <strong>
                  {loading
                    ? '—'
                    : collection.count.toLocaleString()}
                </strong>

                <svg
                  className="alloy-sparkline"
                  viewBox="0 0 128 28"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polyline
                    className="alloy-sparkline__line"
                    points={collection.sparkline
                      .map(
                        (point) =>
                          `${point.x},${point.y}`,
                      )
                      .join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>
            </Link>
          ),
        )}
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

              <div className="alloy-panel__title-row">

                <span className="alloy-panel__title-icon">
                  <PenLine size={16} />
                </span>

                <h2>
                  Recent Activity
                </h2>

              </div>

              <p>
                Latest content updates
              </p>

            </div>

            <Link
              href="/admin/collections/posts"
              className="alloy-panel__view-link"
            >
              <span>
                View all
              </span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />
            </Link>

          </div>

          <div className="alloy-activity">

            {loading ? (
              Array.from({
                length: 3,
              }).map(
                (_, index) => (
                  <div
                    className="alloy-activity__item alloy-skeleton-row"
                    key={index}
                  >
                    <span className="alloy-skeleton alloy-skeleton--icon" />
                    <span className="alloy-skeleton alloy-skeleton--text" />
                    <span className="alloy-skeleton alloy-skeleton--dot" />
                  </div>
                ),
              )
            ) : data.recentPosts.length ===
              0 ? (
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
              data.recentPosts.map(
                (post) => {
                  const title =
                    post.title ||
                    'Untitled post'

                  const updatedAt =
                    post.updatedAt
                      ? new Intl.DateTimeFormat(
                        'en-US',
                        {
                          month:
                            'short',
                          day:
                            'numeric',
                          hour:
                            'numeric',
                          minute:
                            '2-digit',
                        },
                      ).format(
                        new Date(
                          post.updatedAt,
                        ),
                      )
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
                },
              )
            )}

          </div>

          {data.recentPosts.length >
            0 &&
            !loading && (
              <div className="alloy-panel__footer">

                <Link href="/admin/collections/posts">

                  <span>
                    View all activity
                  </span>

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

        <div
          className="alloy-panel alloy-panel--tips"
          onMouseEnter={() =>
            setPauseTips(true)
          }
          onMouseLeave={() =>
            setPauseTips(false)
          }
          onFocusCapture={() =>
            setPauseTips(true)
          }
          onBlurCapture={() =>
            setPauseTips(false)
          }
        >

          <div className="alloy-panel__header">

            <div>

              <div className="alloy-panel__title-row">

                <span className="alloy-panel__title-icon">
                  <Lightbulb size={16} />
                </span>

                <h2>
                  Quick Tips
                </h2>

              </div>

              <p>
                {isEditor
                  ? 'Helpful editorial shortcuts'
                  : 'Tips to help you manage your site better'}
              </p>

            </div>

            <Lightbulb
              className="alloy-panel__header-tip-icon"
              size={20}
              aria-hidden="true"
            />

          </div>

          <div className="alloy-tip-carousel">

            <div className="alloy-tip-carousel__viewport">

              {quickTips.map(
                (tip, index) => (
                  <article
                    key={tip.key}
                    className={`alloy-tip alloy-accent--${tip.accent} ${index === activeTip
                      ? 'is-active'
                      : ''
                      }`}
                    aria-hidden={
                      index !==
                      activeTip
                    }
                  >
                    <div className="alloy-tip__visual">

                      <span className="alloy-tip__visual-orbit alloy-tip__visual-orbit--one" />

                      <span className="alloy-tip__visual-orbit alloy-tip__visual-orbit--two" />

                      <div className="alloy-tip__visual-icon">
                        {tip.icon}
                      </div>

                      <span className="alloy-tip__visual-count">
                        {tip.count.toLocaleString()}
                      </span>

                    </div>

                    <div className="alloy-tip__content">

                      <span className="alloy-tip__eyebrow">
                        {tip.eyebrow}
                      </span>

                      <h3>
                        {tip.title}
                      </h3>

                      <p>
                        {tip.description}
                      </p>

                      <Link href={tip.href}>
                        <span>
                          Open {tip.title}
                        </span>

                        <ArrowRight
                          size={15}
                          aria-hidden="true"
                        />
                      </Link>

                    </div>
                  </article>
                ),
              )}

            </div>

            <div className="alloy-tip-carousel__footer">

              <div
                className="alloy-tip-carousel__dots"
                aria-label="Quick tip slides"
              >
                {quickTips.map(
                  (tip, index) => (
                    <button
                      key={tip.key}
                      type="button"
                      className={`alloy-tip-carousel__dot ${index === activeTip
                        ? 'is-active'
                        : ''
                        }`}
                      aria-label={`Show ${tip.title} tip`}
                      aria-current={
                        index === activeTip
                          ? 'true'
                          : undefined
                      }
                      onClick={() =>
                        goToTip(index)
                      }
                    />
                  ),
                )}
              </div>

              <div className="alloy-tip-carousel__controls">

                <button
                  type="button"
                  onClick={
                    previousTip
                  }
                  aria-label="Previous quick tip"
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>

                <span>
                  {activeTip + 1}/
                  {quickTips.length}
                </span>

                <button
                  type="button"
                  onClick={
                    nextTip
                  }
                  aria-label="Next quick tip"
                >
                  <ChevronRight
                    size={15}
                  />
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="alloy-dashboard__footer">

        <span>
          © {currentYear ?? 'AlloyPress'} AlloyPress.
          All rights reserved.
        </span>

        <span>
          Payload CMS V3.0.0
        </span>

      </footer>

    </main>
  )
}

/* =========================================================
   LOCAL ICON
   ========================================================= */

function AlertTriangleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.3 3.6 2.7 17a2 2 0 0 0 1.74 3h15.12a2 2 0 0 0 1.74-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="16.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  )
}