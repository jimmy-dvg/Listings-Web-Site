import { supabase } from './supabase'
import type { Listing } from '../types/listing'

type ListingPhotoRow = {
  id: string
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

export type EditableListing = {
  id: string
  title: string
  description: string
  price: number
  location: string
  photos: Array<{
    id: string
    path: string
    url: string
    sortOrder: number
  }>
}

type ListingWriteInput = {
  title: string
  description: string
  price: number
  location: string
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
      'id,user_id,title,description,price,location,created_at,listing_photos(id,photo_path,sort_order)',
      { count: 'exact' },
    )
}

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/(^-|-$)/g, '')
}

async function uploadListingPhotos(params: {
  listingId: string
  ownerId: string
  files: File[]
  startingSortOrder?: number
}) {
  const { listingId, ownerId, files, startingSortOrder = 0 } = params

  if (files.length === 0) {
    return
  }

  const rowsToInsert: Array<{
    listing_id: string
    owner_id: string
    photo_path: string
    sort_order: number
  }> = []

  for (const [index, file] of files.entries()) {
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const fileName = `${Date.now()}-${index + 1}-${sanitizeFileName(file.name.replace(/\.[^/.]+$/, ''))}.${extension}`
    const path = `${listingId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' })

    if (uploadError) {
      throw uploadError
    }

    rowsToInsert.push({
      listing_id: listingId,
      owner_id: ownerId,
      photo_path: path,
      sort_order: startingSortOrder + index,
    })
  }

  const { error: insertPhotosError } = await supabase.from('listing_photos').insert(rowsToInsert)
  if (insertPhotosError) {
    throw insertPhotosError
  }
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

export async function fetchMyListingsPage(params: {
  userId: string
  page: number
  pageSize: number
}): Promise<{ listings: Listing[]; total: number }> {
  const { userId, page, pageSize } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await baseListingSelectQuery()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    listings: (data ?? []).map((row) => mapListing(row as ListingRow)),
    total: count ?? 0,
  }
}

export async function deleteMyListingById(listingId: string) {
  const { data: photoRows, error: photoQueryError } = await supabase
    .from('listing_photos')
    .select('photo_path')
    .eq('listing_id', listingId)

  if (photoQueryError) {
    throw photoQueryError
  }

  const paths = (photoRows ?? []).map((row) => row.photo_path)
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('listing-photos').remove(paths)
    if (storageError) {
      throw storageError
    }
  }

  const { error } = await supabase.from('listings').delete().eq('id', listingId)

  if (error) {
    throw error
  }
}

export async function createListingWithPhotos(params: {
  userId: string
  listing: ListingWriteInput
  files: File[]
}) {
  const { userId, listing, files } = params

  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: userId,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  await uploadListingPhotos({
    listingId: data.id,
    ownerId: userId,
    files,
    startingSortOrder: 0,
  })

  return data.id
}

export async function fetchOwnedListingForEdit(params: { listingId: string; userId: string }) {
  const { listingId, userId } = params
  const { data, error } = await baseListingSelectQuery()
    .eq('id', listingId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row = data as ListingRow

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    location: row.location,
    photos: (row.listing_photos ?? [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((photo) => ({
        id: photo.id,
        path: photo.photo_path,
        url: getPublicPhotoUrl(photo.photo_path) ?? '',
        sortOrder: photo.sort_order ?? 0,
      })),
  } satisfies EditableListing
}

export async function updateOwnedListingWithPhotos(params: {
  listingId: string
  userId: string
  listing: ListingWriteInput
  newFiles: File[]
  removePhotoPaths: string[]
}) {
  const { listingId, userId, listing, newFiles, removePhotoPaths } = params

  const { error: listingUpdateError } = await supabase
    .from('listings')
    .update({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
    })
    .eq('id', listingId)
    .eq('user_id', userId)

  if (listingUpdateError) {
    throw listingUpdateError
  }

  if (removePhotoPaths.length > 0) {
    const { error: removeStorageError } = await supabase.storage.from('listing-photos').remove(removePhotoPaths)
    if (removeStorageError) {
      throw removeStorageError
    }

    const { error: removeRowsError } = await supabase
      .from('listing_photos')
      .delete()
      .eq('listing_id', listingId)
      .in('photo_path', removePhotoPaths)

    if (removeRowsError) {
      throw removeRowsError
    }
  }

  if (newFiles.length > 0) {
    const { data: existingRows, error: sortQueryError } = await supabase
      .from('listing_photos')
      .select('sort_order')
      .eq('listing_id', listingId)
      .order('sort_order', { ascending: false })
      .limit(1)

    if (sortQueryError) {
      throw sortQueryError
    }

    const nextSortOrder = (existingRows?.[0]?.sort_order ?? -1) + 1

    await uploadListingPhotos({
      listingId,
      ownerId: userId,
      files: newFiles,
      startingSortOrder: nextSortOrder,
    })
  }
}
