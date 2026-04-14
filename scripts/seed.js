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
        price: template.price + i * 2500,
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

    console.log(`Seeded property ${listing.title} (${photosCount} photos) for ${userSeed.email}`)
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
  console.log('Removed previous properties for seed users')

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
