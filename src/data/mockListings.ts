import type { Listing } from '../types/listing'

export const mockListings: Listing[] = [
  {
    id: 'listing-1',
    title: 'Sunny Studio near Downtown',
    price: 950,
    location: 'Austin',
    coverImageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    description: 'A bright studio with a compact kitchen and balcony view.',
    ownerId: 'owner-1',
    createdAt: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'listing-2',
    title: 'Minimal Loft with Workspace',
    price: 1450,
    location: 'Seattle',
    coverImageUrl:
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
    description: 'Open-plan loft designed for remote work and quiet evenings.',
    ownerId: 'owner-2',
    createdAt: '2026-04-11T10:30:00.000Z',
  },
  {
    id: 'listing-3',
    title: 'Cozy One-bedroom by the Park',
    price: 1200,
    location: 'Chicago',
    coverImageUrl:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm interior, renovated bathroom, and quick transit access.',
    ownerId: 'owner-1',
    createdAt: '2026-04-13T16:15:00.000Z',
  },
]
