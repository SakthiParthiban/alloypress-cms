import type { Access, CollectionConfig } from 'payload'

import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  TextStateFeature,
  LinkFeature,
  UploadFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { textStateConfig } from '@/fields/textStateConfig'

// ============================================================
// ROLE HELPERS
// ============================================================

const isEditorOrAdmin: Access = ({ req }) => {
  const role = req.user?.role

  return role === 'editor' || role === 'admin'
}

const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

// ============================================================
// POSTS COLLECTION
// ============================================================

export const Posts: CollectionConfig = {
  slug: 'posts',

  // ==========================================================
  // ACCESS CONTROL
  // ==========================================================

  access: {
    // Admin + Editor + Viewer can view posts
    read: () => true,

    // Admin + Editor can create
    create: isEditorOrAdmin,

    // Admin + Editor can edit
    update: isEditorOrAdmin,

    // Admin only can delete
    delete: isAdmin,
  },

  // ==========================================================
  // PUBLISH LIFECYCLE
  // ==========================================================
  // Keep Payload's built-in status, the custom workflow status,
  // and publishedAt consistent without overwriting historical
  // WordPress publication dates restored by migration.
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (data._status === 'published') {
          // Only assign a date when a published document does not
          // already have one. This preserves migrated WP dates.
          if (!data.publishedAt) {
            data.publishedAt = new Date().toISOString()
          }

          data.workflowStatus = 'published'
        }

        return data
      },
    ],
  },

  // ==========================================================
  // CUSTOM ENDPOINTS
  // ==========================================================

  endpoints: [
    {
      path: '/sitemap-posts',
      method: 'get',

      handler: async (req) => {
        const posts = await req.payload.find({
          collection: 'posts',

          where: {
            and: [
              {
                includeInSitemap: {
                  equals: true,
                },
              },
              {
                _status: {
                  equals: 'published',
                },
              },
            ],
          },

          limit: 1000,
          depth: 1,

          select: {
            title: true,
            slug: true,
            publishedAt: true,
            updatedAt: true,
            includeInSitemap: true,
          },
        })

        return Response.json({
          posts: posts.docs,
        })
      },
    },

    {
      path: '/news-sitemap-posts',
      method: 'get',

      handler: async (req) => {
        const posts = await req.payload.find({
          collection: 'posts',

          where: {
            and: [
              {
                includeInSitemap: {
                  equals: true,
                },
              },
              {
                _status: {
                  equals: 'published',
                },
              },
              {
                publishedAt: {
                  greater_than_equal: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                },
              },
            ],
          },

          limit: 1000,
          depth: 1,

          select: {
            title: true,
            slug: true,
            publishedAt: true,
          },
        })

        return Response.json({
          posts: posts.docs,
        })
      },
    },
  ],

  // ==========================================================
  // ADMIN UI
  // ==========================================================

  admin: {
    useAsTitle: 'title',

    description:
      'Create, edit and manage AlloyPress blog posts.',

    components: {
      edit: {
        beforeDocumentControls: [
          '/components/DocumentUndoRedo#DocumentUndoRedo',
        ],
      },
    },

    defaultColumns: [
      'title',
      'category',
      'author',
      'publishedAt',
      'updatedAt',
      '_status',
    ],

    livePreview: {
      url: ({ data }) => {
        const slug = data?.slug

        if (!slug) {
          return 'http://localhost:3000/blogs'
        }

        return `http://localhost:3000/blogs/${slug}`
      },
    },
  },

  // ==========================================================
  // DRAFTS / AUTOSAVE / SCHEDULE
  // ==========================================================

  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
  },

  // ==========================================================
  // FIELDS
  // ==========================================================

  fields: [
    // ========================================================
    // TITLE
    // ========================================================

    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',

      admin: {
        description:
          'The main title of the blog post.',
      },
    },

    // ========================================================
    // SLUG
    // ========================================================

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug',

      admin: {
        description:
          'The URL-friendly identifier used for the post URL.',
      },
    },

    // ========================================================
    // CONTENT
    // ========================================================

    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Content',

      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,

          FixedToolbarFeature(),

          // ==================================================
          // TEXT COLOR / FONT / SIZE / STYLE
          // ==================================================
          //
          // NOTE: the migration script's snapBackgroundColors()
          // snaps arbitrary inline background-color styles to the
          // named swatches: green / yellow / blue / red / gray.
          // Make sure textStateConfig.backgroundColor (in
          // '@/fields/textStateConfig') defines exactly those
          // swatch names, or migrated background colors won't be
          // recognized by the editor/frontend.
          // ==================================================

          TextStateFeature({
            state: {
              color: textStateConfig.color,
              backgroundColor: textStateConfig.backgroundColor,
              fontFamily: textStateConfig.fontFamily,
              fontSize: textStateConfig.fontSize,
              textStyle: textStateConfig.textStyle,
              decoration: textStateConfig.decoration,
            },
          }),

          // ==================================================
          // LINKS
          // ==================================================

          LinkFeature({
            fields: ({ defaultFields }) => [
              ...defaultFields.filter(
                (field) => field.name !== 'rel',
              ),

              {
                name: 'nofollow',
                type: 'checkbox',
                label: 'Set to nofollow',
                defaultValue: false,

                admin: {
                  description:
                    'Use this when search engines should not pass SEO authority through this link.',
                },
              },

              {
                name: 'sponsored',
                type: 'checkbox',
                label: 'Set to sponsored',
                defaultValue: false,

                admin: {
                  description:
                    'Use this for paid, sponsored, affiliate, or advertising links.',
                },
              },

              {
                name: 'noopener',
                type: 'checkbox',
                label: 'Set to noopener',
                defaultValue: false,

                admin: {
                  description:
                    'Prevents the destination page from accessing the original page through window.opener.',
                },
              },

              {
                name: 'noreferrer',
                type: 'checkbox',
                label: 'Set to noreferrer',
                defaultValue: false,

                admin: {
                  description:
                    'Prevents the referring page URL from being sent to the destination.',
                },
              },
            ],
          }),

          // ==================================================
          // MEDIA / IMAGE UPLOADS
          // ==================================================
          // Explicitly enable Payload upload nodes for content images.
          // The migration script uses data-lexical-upload-id and
          // data-lexical-upload-relation-to="media".
          // ==================================================

          UploadFeature({
            collections: {
              media: {
                fields: [],
              },
            },
          }),

          // ==================================================
          // BLOCKS
          // ==================================================

          BlocksFeature({
            blocks: [
              // =================================================
              // CODE BLOCK
              // =================================================

              CodeBlock({
                languages: {
                  plaintext: 'Plain Text',
                  js: 'JavaScript',
                  ts: 'TypeScript',
                  jsx: 'JSX',
                  tsx: 'TSX',
                  html: 'HTML',
                  css: 'CSS',
                  json: 'JSON',
                  bash: 'Bash',
                  sql: 'SQL',
                },
              }),

              // =================================================
              // VIDEO / EMBED (YouTube, Vimeo, other iframes)
              // =================================================

              {
                slug: 'videoEmbed',

                labels: {
                  singular: 'Video / Embed',
                  plural: 'Videos / Embeds',
                },

                fields: [
                  {
                    name: 'url',
                    type: 'text',
                    required: true,
                    label: 'Video / Embed URL',
                  },

                  {
                    name: 'provider',
                    type: 'select',
                    defaultValue: 'youtube',

                    options: [
                      {
                        label: 'YouTube',
                        value: 'youtube',
                      },
                      {
                        label: 'Vimeo',
                        value: 'vimeo',
                      },
                      {
                        label: 'Other',
                        value: 'other',
                      },
                    ],
                  },

                  {
                    name: 'caption',
                    type: 'text',
                    label: 'Caption',
                  },
                ],
              },

              // =================================================
              // ⬇ NEW — SELF-HOSTED VIDEO FILE
              // =================================================
              // The migration script's video pass (self-hosted
              // <video src="..."> tags, as opposed to <iframe>
              // embeds) emits blockType: 'videoFile' with a
              // `video` upload relation + `caption`. This block
              // was referenced by the script but never registered
              // here, so those videos would fail to save.
              // =================================================

              {
                slug: 'videoFile',

                labels: {
                  singular: 'Video File',
                  plural: 'Video Files',
                },

                fields: [
                  {
                    name: 'video',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,

                    label: 'Video File',

                    admin: {
                      description:
                        'Select a self-hosted video file from the Media library.',
                    },
                  },

                  {
                    name: 'caption',
                    type: 'text',
                    label: 'Caption',
                  },
                ],
              },

              // =================================================
              // AUDIO
              // =================================================

              {
                slug: 'audio',

                labels: {
                  singular: 'Audio',
                  plural: 'Audio',
                },

                fields: [
                  {
                    name: 'audio',
                    type: 'upload',
                    relationTo: 'media',
                    required: true,

                    label: 'Audio File',

                    admin: {
                      description:
                        'Select an audio file from the Media library.',
                    },
                  },

                  {
                    name: 'title',
                    type: 'text',
                    label: 'Audio Title',

                    admin: {
                      description:
                        'Optional title displayed above the audio player.',
                    },
                  },

                  {
                    name: 'caption',
                    type: 'text',
                    label: 'Caption',

                    admin: {
                      description:
                        'Optional caption displayed below the audio player.',
                    },
                  },
                ],
              },

              // =================================================
              // ⬇ NEW — STYLED BOX (bordered / highlighted callout)
              // =================================================
              // extractStyledBoxes() in the migration script
              // detects WordPress <div>/<section>/<blockquote>
              // elements with an inline border and/or
              // background-color (FAQ boxes, quote boxes, "Alloy
              // Pick" cards, etc.) and emits blockType:
              // 'styledBox' with heading/text/backgroundColor/
              // borderColor/borderWidth. The script's own comment
              // warned this block was required but not yet
              // registered — added here.
              // =================================================

              {
                slug: 'styledBox',

                labels: {
                  singular: 'Styled Box',
                  plural: 'Styled Boxes',
                },

                fields: [
                  {
                    name: 'heading',
                    type: 'text',
                    label: 'Heading',
                  },

                  {
                    name: 'text',
                    type: 'textarea',
                    label: 'Body Text',
                  },

                  {
                    name: 'backgroundColor',
                    type: 'select',
                    label: 'Background Color',

                    options: [
                      { label: 'Green', value: 'green' },
                      { label: 'Yellow', value: 'yellow' },
                      { label: 'Blue', value: 'blue' },
                      { label: 'Red', value: 'red' },
                      { label: 'Gray', value: 'gray' },
                    ],

                    admin: {
                      description:
                        'Matches the swatch names produced by the WordPress migration background-color snapping.',
                    },
                  },

                  {
                    name: 'borderColor',
                    type: 'select',
                    label: 'Border Color',

                    options: [
                      { label: 'Green', value: 'green' },
                      { label: 'Yellow', value: 'yellow' },
                      { label: 'Blue', value: 'blue' },
                      { label: 'Red', value: 'red' },
                      { label: 'Gray', value: 'gray' },
                      { label: 'Brand Green', value: 'brand-green' },
                    ],

                    admin: {
                      description:
                        'Matches the swatch names produced by the WordPress migration border-color snapping (includes brand-green for #1DBA6E).',
                    },
                  },

                  {
                    name: 'borderWidth',
                    type: 'text',
                    label: 'Border Width',

                    admin: {
                      description:
                        'e.g. "1.5px". Taken from the original inline border-width style when present.',
                    },
                  },
                ],
              },

              // =================================================
              // ⬇ NEW — CTA BUTTON
              // =================================================
              // extractButtons() in the migration script detects
              // WordPress button elements (Divi et_pb_button,
              // Gutenberg wp-block-button__link, .button/.btn) and
              // emits blockType: 'ctaButton' with label + url.
              // This block was referenced but never registered —
              // added here.
              // =================================================

              {
                slug: 'ctaButton',

                labels: {
                  singular: 'CTA Button',
                  plural: 'CTA Buttons',
                },

                fields: [
                  {
                    name: 'label',
                    type: 'text',
                    required: true,
                    label: 'Button Label',
                  },

                  {
                    name: 'url',
                    type: 'text',
                    required: true,
                    label: 'Button URL',
                  },
                ],
              },
            ],
          }),

          // ==================================================
          // TABLE
          // ==================================================

          EXPERIMENTAL_TableFeature(),
        ],
      }),

      admin: {
        description:
          'Main article content. Add formatted text, links, images, videos, audio, styled boxes, buttons, code and tables.',
      },
    },

    // ========================================================
    // EXCERPT
    // ========================================================

    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',

      admin: {
        description:
          'Short summary used in blog listings and RSS-style outputs.',
      },
    },

    // ========================================================
    // FEATURED IMAGE
    // ========================================================

    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },

    // ========================================================
    // IMAGE POSITION
    // ========================================================

    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      defaultValue: 'full',

      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Right',
          value: 'right',
        },
        {
          label: 'Full Width',
          value: 'full',
        },
      ],
    },

    // ========================================================
    // CATEGORY
    // ========================================================

    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      hasMany: false,
      label: 'Category',
    },

    // ========================================================
    // TAGS
    // ========================================================

    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
    },

    // ========================================================
    // AUTHOR
    // ========================================================

    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      label: 'Author',
    },

    // ========================================================
    // PUBLISHED DATE
    // ========================================================

    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',

      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    // ========================================================
    // WORKFLOW STATUS
    // ========================================================

    {
      name: 'workflowStatus',
      type: 'select',
      label: 'Workflow Status',
      defaultValue: 'draft',

      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Review',
          value: 'review',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],

      admin: {
        description:
          'Editorial workflow: Draft → Review → Published.',
      },
    },

    // ========================================================
    // CORNERSTONE
    // ========================================================

    {
      name: 'cornerstone',
      type: 'checkbox',
      defaultValue: false,
      label: 'Cornerstone / Pillar Content',

      admin: {
        description:
          'Marks this article as important pillar content for internal linking priority.',
      },
    },

    // ========================================================
    // SITEMAP
    // ========================================================

    {
      name: 'includeInSitemap',
      type: 'checkbox',
      defaultValue: true,
      label: 'Include in Sitemap',

      admin: {
        description:
          'Controls whether this published post should appear in the sitemap.',
      },
    },

    // ========================================================
    // PREVIOUS URL
    // ========================================================

    {
      name: 'redirectFrom',
      type: 'text',
      label: 'Previous URL',

      admin: {
        description:
          'Optional previous URL/slug that should redirect to this post after a URL change.',
      },
    },

    // ========================================================
    // MIGRATION / INTERNAL
    // ========================================================

    {
      name: 'legacy',
      type: 'group',
      label: 'Migration / Internal',

      admin: {
        description:
          'Original WordPress information used only during migration.',
      },

      fields: [
        {
          name: 'wordpressId',
          type: 'number',
          unique: true,
          index: true,
          label: 'WordPress ID',
        },

        // ⬇ NEW — preserves the ORIGINAL WordPress post.modified date
        // for migrated posts, separate from Payload's own updatedAt.
        // Empty for posts created directly in Payload.
        {
          name: 'wordpressModifiedAt',
          type: 'date',
          label: 'WordPress Modified Date',
          index: true,

          admin: {
            description:
              'Historical WordPress "modified" date, preserved from migration. Empty for posts created directly in Payload.',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
}