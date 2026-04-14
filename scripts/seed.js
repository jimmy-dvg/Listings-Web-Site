import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, '')

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

loadEnvFile(path.join(projectRoot, '.env'))
loadEnvFile(path.join(projectRoot, '.env.local'))

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || (!serviceRoleKey && !publishableKey)) {
  console.error(
    'Missing SUPABASE_URL and key. Provide SUPABASE_SERVICE_ROLE_KEY, or VITE_SUPABASE_PUBLISHABLE_KEY for user-session seeding.',
  )
  process.exit(1)
}

const adminClient = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

const usersToSeed = [
  { email: 'steve@gmail.com', password: 'pass123', name: 'Steve Carter', phone: '+1 555 100 1001' },
  { email: 'maria@gmail.com', password: 'pass123', name: 'Maria Lopez', phone: '+1 555 100 1002' },
]

const listingTemplates = [
  {
    title: 'Modern 3-Bedroom Home with Pool',
    description: 'Move-in ready family home with private pool, garage, and updated kitchen.',
    price: 425000,
    location: 'Austin, TX',
  },
  {
    title: 'Luxury Downtown Condo',
    description: 'High-floor condo with skyline views, concierge services, and premium finishes.',
    price: 610000,
    location: 'Seattle, WA',
  },
  {
    title: 'Renovated Townhouse Near Park',
    description: 'Stylish townhouse with finished basement and private patio close to schools.',
    price: 355000,
    location: 'Chicago, IL',
  },
  {
    title: '4-Bedroom Suburban Family House',
    description: 'Spacious lot, open floor plan, and upgraded appliances in a calm neighborhood.',
    price: 540000,
    location: 'Denver, CO',
  },
  {
    title: 'Contemporary Home with Large Backyard',
    description: 'Single-family home with home office, landscaped yard, and two-car garage.',
    price: 485000,
    location: 'Portland, OR',
  },
  {
    title: 'Waterfront Villa with Private Dock',
    description: 'Exclusive villa featuring water views, private dock, and luxury interior design.',
    price: 1295000,
    location: 'Miami, FL',
  },
]

const photoSourceUrls = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function fetchUserByEmail(email) {
  if (!adminClient) {
    return null
  }

  const perPage = 200

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })

    if (error) {
      throw error
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase())
    if (user) {
      return user
    }

    if (data.users.length < perPage) {
      break
    }
  }

  return null
}

function createSessionClient() {
  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function upsertProfile(client, user, userSeed) {
  const { error } = await client.from('user_profiles').upsert(
    {
      id: user.id,
      name: userSeed.name,
      email: userSeed.email,
      phone_number: userSeed.phone,
    },
    { onConflict: 'id' },
  )

  if (error) {
    throw error
  }
}

async function uploadPhotoForListing({
  client,
  listingId,
  userId,
  listingTitle,
  photoIndex,
  listingSeedOffset,
}) {
  const sourceIndex = (listingSeedOffset + photoIndex - 1) % photoSourceUrls.length
  const sourceUrl = photoSourceUrls[sourceIndex]
  const response = await fetch(sourceUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch source image: ${sourceUrl}`)
  }

  const bytes = await response.arrayBuffer()
  const path = `${listingId}/${slugify(listingTitle)}-${photoIndex}.jpg`

  const { error: uploadError } = await client.storage
    .from('listing-photos')
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { error: rowError } = await client.from('listing_photos').upsert(
    {
      listing_id: listingId,
      owner_id: userId,
      photo_path: path,
      sort_order: photoIndex,
    },
    { onConflict: 'photo_path' },
  )

  if (rowError) {
    throw rowError
  }
}

async function seedListingsForUser(client, user, userSeed, templateOffset) {
  const listingsCount = randomInt(4, 5)

  for (let i = 0; i < listingsCount; i += 1) {
    const template = listingTemplates[(templateOffset + i) % listingTemplates.length]

    const { data: listing, error: listingError } = await client
      .from('listings')
      .insert({
        user_id: user.id,
        title: `${template.title} #${i + 1}`,
        description: template.description,
        price: template.price + i * 2500,
        location: template.location,
      })
      .select('id, title')
      .single()

    if (listingError) {
      throw listingError
    }

    const photosCount = randomInt(2, 3)
    const listingSeedOffset = (templateOffset * 3 + i * 2) % photoSourceUrls.length
    for (let photoIndex = 1; photoIndex <= photosCount; photoIndex += 1) {
      await uploadPhotoForListing({
        client,
        listingId: listing.id,
        userId: user.id,
        listingTitle: listing.title,
        photoIndex,
        listingSeedOffset,
      })
    }

    console.log(`Seeded property ${listing.title} (${photosCount} photos) for ${userSeed.email}`)
  }
}

async function deleteOwnListings(client, userId) {
  const { error } = await client.from('listings').delete().eq('user_id', userId)
  if (error && error.code !== 'PGRST116') {
    throw error
  }
}

async function createOrGetUserWithAdmin(userSeed) {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: userSeed.email,
    password: userSeed.password,
    email_confirm: true,
  })

  if (!error && data.user) {
    return data.user
  }

  if (error?.message?.toLowerCase().includes('already')) {
    const existingUser = await fetchUserByEmail(userSeed.email)
    if (existingUser) {
      return existingUser
    }
  }

  throw error ?? new Error(`Unable to create/find user ${userSeed.email}`)
}

async function createOrLoginUserSession(userSeed) {
  const client = createSessionClient()

  const { error: signUpError } = await client.auth.signUp({
    email: userSeed.email,
    password: userSeed.password,
    options: {
      data: {
        name: userSeed.name,
      },
    },
  })

  if (signUpError && !signUpError.message.toLowerCase().includes('already')) {
    throw signUpError
  }

  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email: userSeed.email,
    password: userSeed.password,
  })

  if (signInError || !signInData.user) {
    throw signInError ?? new Error(`Unable to sign in ${userSeed.email}`)
  }

  return { client, user: signInData.user }
}

async function main() {
  if (adminClient) {
    const seededUsers = []

    for (const [index, userSeed] of usersToSeed.entries()) {
      const user = await createOrGetUserWithAdmin(userSeed)
      await upsertProfile(adminClient, user, userSeed)
      seededUsers.push({ user, userSeed, index })
      console.log(`Prepared user ${userSeed.email}`)
    }

    const userIds = seededUsers.map((entry) => entry.user.id)
    const { error: bulkDeleteError } = await adminClient.from('listings').delete().in('user_id', userIds)
    if (bulkDeleteError) {
      throw bulkDeleteError
    }
    console.log('Removed previous properties for seed users')

    for (const entry of seededUsers) {
      await seedListingsForUser(adminClient, entry.user, entry.userSeed, entry.index * 2)
    }
  } else {
    for (const [index, userSeed] of usersToSeed.entries()) {
      const { client, user } = await createOrLoginUserSession(userSeed)
      await upsertProfile(client, user, userSeed)
      await deleteOwnListings(client, user.id)
      await seedListingsForUser(client, user, userSeed, index * 2)
      console.log(`Prepared user ${userSeed.email}`)
    }
  }

  console.log('Seeding complete')
}

main().catch((error) => {
  console.error('Seeding failed')
  console.error(error)
  process.exit(1)
})
