import { slugField } from 'payload'
import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

const canRead: Access = ({ req }) => {
  const role = req.user?.role

  return role === 'editor' || role === 'admin'
}

export const Tags: CollectionConfig = {
  slug: 'tags',

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Tags for AlloyPress posts.',
  },

  access: {
    read: canRead,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,

      admin: {
        description:
          'Tag name displayed on the website.',
      },
    },

    slugField({
      useAsSlug: 'name',
      required: true,
    }),

    {
      name: 'description',
      type: 'textarea',

      admin: {
        description:
          'Optional description for the tag.',
      },
    },

    {
      name: 'legacy',
      type: 'group',

      admin: {
        description:
          'Original WordPress information preserved for migration.',
      },

      fields: [
        {
          name: 'wordpressId',
          type: 'number',
          unique: true,
          index: true,

          admin: {
            description:
              'Original WordPress term ID.',
          },
        },
      ],
    },
  ],
}