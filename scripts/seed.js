import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY env vars.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const usersToSeed = [
  { email: 'steve@gmail.com', password: 'pass123', name: 'Steve Carter', phone: '+1 555 100 1001' },
  { email: 'maria@gmail.com', password: 'pass123', name: 'Maria Lopez', phone: '+1 555 100 1002' },
]

const listingTemplates = [
  {
    title: 'Modern Downtown Studio',
    description: 'Compact and modern studio near cafes and transit.',
    price: 980,
    location: 'Austin, TX',
  },
  {
    title: 'Bright Loft with Large Windows',
    description: 'Open loft with natural light and work-friendly layout.',
    price: 1450,
    location: 'Seattle, WA',
  },
  {
    title: 'Cozy One-bedroom by the Park',
    description: 'Comfortable one-bedroom in a quiet neighborhood.',
    price: 1250,
    location: 'Chicago, IL',
  },
  {
    title: 'Family Apartment with Balcony',
    description: 'Spacious two-bedroom apartment with city views.',
    price: 1700,
    location: 'Denver, CO',
  },
  {
    title: 'Minimal Home with Backyard',
    description: 'Single-level home with private yard and storage space.',
    price: 2100,
    location: 'Portland, OR',
  },
]

const photoSourceUrls = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
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
  const perPage = 200

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

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

async function createOrGetUser(userSeed) {
  const { data, error } = await supabase.auth.admin.createUser({
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

async function upsertProfile(user, userSeed) {
  const { error } = await supabase.from('user_profiles').upsert(
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

async function uploadPhotoForListing({ listingId, userId, listingTitle, photoIndex }) {
  const sourceUrl = photoSourceUrls[(photoIndex - 1) % photoSourceUrls.length]
  const response = await fetch(sourceUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch source image: ${sourceUrl}`)
  }

  const bytes = await response.arrayBuffer()
  const path = `${listingId}/${slugify(listingTitle)}-${photoIndex}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('listing-photos')
    .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) {
    throw uploadError
  }

  const { error: rowError } = await supabase.from('listing_photos').upsert(
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

async function seedListingsForUser(user, userSeed, templateOffset) {
  const listingsCount = randomInt(4, 5)

  for (let i = 0; i < listingsCount; i += 1) {
    const template = listingTemplates[(templateOffset + i) % listingTemplates.length]

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: `${template.title} #${i + 1}`,
        description: template.description,
        price: template.price + i * 15,
        location: template.location,
      })
      .select('id, title')
      .single()

    if (listingError) {
      throw listingError
    }

    const photosCount = randomInt(2, 3)
    for (let photoIndex = 1; photoIndex <= photosCount; photoIndex += 1) {
      await uploadPhotoForListing({
        listingId: listing.id,
        userId: user.id,
        listingTitle: listing.title,
        photoIndex,
      })
    }

    console.log(`Seeded listing ${listing.title} (${photosCount} photos) for ${userSeed.email}`)
  }
}

async function cleanExistingListingsForUsers(userIds) {
  const { error } = await supabase.from('listings').delete().in('user_id', userIds)
  if (error) {
    throw error
  }
}

async function main() {
  const seededUsers = []

  for (const [index, userSeed] of usersToSeed.entries()) {
    const user = await createOrGetUser(userSeed)
    await upsertProfile(user, userSeed)
    seededUsers.push({ user, userSeed, index })
    console.log(`Prepared user ${userSeed.email}`)
  }

  await cleanExistingListingsForUsers(seededUsers.map((entry) => entry.user.id))
  console.log('Removed previous listings for seed users')

  for (const entry of seededUsers) {
    await seedListingsForUser(entry.user, entry.userSeed, entry.index * 2)
  }

  console.log('Seeding complete')
}

main().catch((error) => {
  console.error('Seeding failed')
  console.error(error)
  process.exit(1)
})
