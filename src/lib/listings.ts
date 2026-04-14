import { supabase } from './supabase'
import type { Listing } from '../types/listing'

type ListingPhotoRow = {
  photo_path: string
  sort_order: number | null
}

type ListingRow = {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  location: string
  created_at: string
  listing_photos: ListingPhotoRow[] | null
}

type UserProfileRow = {
  name: string | null
  email: string
  phone_number: string | null
}

export type ListingDetails = Listing & {
  photoUrls: string[]
  seller: {
    name: string | null
    email: string | null
    phoneNumber: string | null
  }
}

function getPublicPhotoUrl(path: string | null | undefined) {
  if (!path) {
    return undefined
  }

  return supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl
}

function mapListing(row: ListingRow): Listing {
  const firstPhoto = (row.listing_photos ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]
    ?.photo_path

  return {
    id: row.id,
    ownerId: row.user_id,
    title: row.title,
    description: row.description,
    price: row.price,
    location: row.location,
    createdAt: row.created_at,
    coverImageUrl: getPublicPhotoUrl(firstPhoto),
  }
}

function buildPhotoUrls(photos: ListingPhotoRow[] | null) {
  return (photos ?? [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((photo) => getPublicPhotoUrl(photo.photo_path))
    .filter((url): url is string => Boolean(url))
}

function baseListingSelectQuery() {
  return supabase
    .from('listings')
    .select(
      'id,user_id,title,description,price,location,created_at,listing_photos(photo_path,sort_order)',
      { count: 'exact' },
    )
}

function sanitizeSearchToken(value: string) {
  return value.replace(/,/g, '\\,').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export async function fetchLatestListings(limit = 6): Promise<Listing[]> {
  const { data, error } = await baseListingSelectQuery().order('created_at', { ascending: false }).limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => mapListing(row as ListingRow))
}

export async function fetchListingsPage(params: {
  page: number
  pageSize: number
  search: string
}): Promise<{ listings: Listing[]; total: number }> {
  const { page, pageSize, search } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = baseListingSelectQuery().order('created_at', { ascending: false }).range(from, to)

  const cleanedSearch = search.trim()
  if (cleanedSearch) {
    const token = sanitizeSearchToken(cleanedSearch)
    query = query.or(
      `title.ilike.%${token}%,description.ilike.%${token}%,location.ilike.%${token}%`,
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    listings: (data ?? []).map((row) => mapListing(row as ListingRow)),
    total: count ?? 0,
  }
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await baseListingSelectQuery().eq('id', id).maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapListing(data as ListingRow) : null
}

export async function fetchListingDetailsById(id: string): Promise<ListingDetails | null> {
  const { data, error } = await baseListingSelectQuery().eq('id', id).maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const listing = mapListing(data as ListingRow)
  const photoUrls = buildPhotoUrls((data as ListingRow).listing_photos)

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('name,email,phone_number')
    .eq('id', listing.ownerId)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  const sellerProfile = (profile as UserProfileRow | null) ?? null

  return {
    ...listing,
    photoUrls,
    seller: {
      name: sellerProfile?.name ?? null,
      email: sellerProfile?.email ?? null,
      phoneNumber: sellerProfile?.phone_number ?? null,
    },
  }
}
