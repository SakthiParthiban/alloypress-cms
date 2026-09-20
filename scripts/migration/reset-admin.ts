import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
})

async function resetAdmin() {
  const { default: config } = await import('../../src/payload.config')

  const payload = await getPayload({
    config,
  })

  const email = 'sakthiparthibans@gmail.com'
  const newPassword = 'P@rt1276'

  console.log(`Looking for user: ${email}`)

  const result = await payload.find({
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

  if (!result.docs.length) {
    console.error('❌ User not found')
    process.exit(1)
  }

  const user = result.docs[0]

  console.log(`✓ User found: ${user.id}`)

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      password: newPassword,
    },
    overrideAccess: true,
  })

  console.log('')
  console.log('========================================')
  console.log(' Password Reset Successful')
  console.log('========================================')
  console.log(`Email: ${email}`)
  console.log(`User ID: ${user.id}`)
  console.log('You can now login with the new password.')
  console.log('========================================')

  process.exit(0)
}

resetAdmin().catch((error) => {
  console.error('')
  console.error('❌ Password reset failed:')
  console.error(error)
  process.exit(1)
})