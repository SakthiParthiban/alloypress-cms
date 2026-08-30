import type {
  Access,
  CollectionConfig,
  FieldAccess,
} from 'payload'

// ============================================================
// ACCESS HELPERS
// ============================================================

// ------------------------------------------------------------
// ADMIN ONLY
// ------------------------------------------------------------

const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

// ------------------------------------------------------------
// AUTHENTICATED USERS
// Admin + Editor + Viewer
// ------------------------------------------------------------

const isAuthenticated = ({ req }: { req: any }) => {
  return Boolean(req.user)
}

// ------------------------------------------------------------
// ADMIN FIELD ACCESS
// Used for fields that only Admin can change
// ------------------------------------------------------------

const isAdminField: FieldAccess = ({ req }) => {
  return req.user?.role === 'admin'
}

// ============================================================
// USERS COLLECTION
// ============================================================

export const Users: CollectionConfig = {
  slug: 'users',

  // ==========================================================
  // AUTH
  // ==========================================================

  auth: true,

  // ==========================================================
  // ADMIN UI
  // ==========================================================

  admin: {
    useAsTitle: 'displayName',

    defaultColumns: [
      'email',
      'displayName',
      'role',
      'createdAt',
      'updatedAt',
    ],

    description:
      'Manage AlloyPress users and access roles.',
  },

  // ==========================================================
  // COLLECTION ACCESS
  // ==========================================================

  access: {
    // --------------------------------------------------------
    // ADMIN PANEL
    // Admin + Editor + Viewer
    // --------------------------------------------------------

    admin: isAuthenticated,

    // --------------------------------------------------------
    // READ USERS
    // Admin + Editor + Viewer
    // --------------------------------------------------------

    read: isAuthenticated,

    // --------------------------------------------------------
    // CREATE USER
    // Admin only
    // --------------------------------------------------------

    create: isAdmin,

    // --------------------------------------------------------
    // UPDATE USER
    // Admin only
    // --------------------------------------------------------

    update: isAdmin,

    // --------------------------------------------------------
    // DELETE USER
    // Admin only
    // --------------------------------------------------------

    delete: isAdmin,
  },

  // ==========================================================
  // FIELDS
  // ==========================================================

  fields: [

    // ========================================================
    // DISPLAY NAME
    // ========================================================

    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name',

      admin: {
        description:
          'Display name shown across the AlloyPress system.',
      },
    },

    // ========================================================
    // USERNAME
    // ========================================================

    {
      name: 'username',
      type: 'text',
      unique: true,
      index: true,
      label: 'Username',

      admin: {
        description:
          'Unique username for the user.',
      },
    },

    // ========================================================
    // WEBSITE
    // ========================================================

    {
      name: 'website',
      type: 'text',
      label: 'Website',

      admin: {
        description:
          'Optional website URL associated with the user.',
      },
    },

    // ========================================================
    // BIO
    // ========================================================

    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio / Description',

      admin: {
        description:
          'Short description or biography of the user.',
      },
    },

    // ========================================================
    // ROLE
    // ========================================================

    {
      name: 'role',
      type: 'select',
      required: true,

      defaultValue: 'viewer',

      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Viewer',
          value: 'viewer',
        },
      ],

      // ------------------------------------------------------
      // ROLE ACCESS
      // Only Admin can create/change roles
      // ------------------------------------------------------

      access: {
        create: isAdminField,
        update: isAdminField,
      },

      admin: {
        position: 'sidebar',

        description:
          'Admin: full access. Editor: content management. Viewer: read-only access.',
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
          'Original WordPress information preserved for migration.',
      },

      fields: [

        // ----------------------------------------------------
        // WORDPRESS USER ID
        // ----------------------------------------------------

        {
          name: 'wordpressId',
          type: 'number',
          unique: true,
          index: true,
          label: 'WordPress User ID',
        },

        // ----------------------------------------------------
        // WORDPRESS USERNAME
        // ----------------------------------------------------

        {
          name: 'wordpressUsername',
          type: 'text',
          label: 'WordPress Username',
        },

        // ----------------------------------------------------
        // WORDPRESS ROLE
        // ----------------------------------------------------

        {
          name: 'wordpressRole',
          type: 'text',
          label: 'WordPress Role',
        },
      ],
    },
  ],
}