import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

async function createAdmin() {
  const { default: config } = await import('../../src/payload.config')

  const payload = await getPayload({
    config,
  })

  const email = 'sakthiparthibans@gmail.com'
  const password = 'YOUR_NEW_STRONG_PASSWORD'

  console.log(`Looking for user: ${email}`)

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    console.log('❌ User already exists:', existing.docs[0].id)
    process.exit(1)
  }

 const user = await payload.create({
  collection: 'users',
  data: {
    email,
    password,
    role: 'admin',
  },
  overrideAccess: true,
})

  console.log('')
  console.log('========================================')
  console.log(' Admin User Created Successfully')
  console.log('========================================')
  console.log(`Email: ${email}`)
  console.log(`User ID: ${user.id}`)
  console.log('========================================')

  process.exit(0)
}

createAdmin().catch((error) => {
  console.error('❌ Failed to create admin:', error)
  process.exit(1)
})