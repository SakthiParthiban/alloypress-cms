import type { CollectionConfig } from 'payload'

export const NotFoundLogs: CollectionConfig = {
  slug: 'not-found-logs',

  admin: {
    useAsTitle: 'path',

    defaultColumns: [
      'path',
      'referrer',
      'createdAt',
    ],
  },

  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
      label: 'Requested URL',
    },

    {
      name: 'referrer',
      type: 'text',
      label: 'Referrer',
    },

    {
      name: 'userAgent',
      type: 'textarea',
      label: 'User Agent',
    },

    {
      name: 'ip',
      type: 'text',
      label: 'IP Address',
      admin: {
        description:
          'Optional. Only store this if required by the project privacy policy.',
      },
    },

    {
      name: 'count',
      type: 'number',
      defaultValue: 1,
      label: 'Count',
    },

    {
      name: 'lastSeenAt',
      type: 'date',
      label: 'Last Seen',
    },
  ],
}