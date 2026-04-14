# EstateHub - Real Estate Marketplace

EstateHub is a full-stack real estate web app for properties for sale.

Visitors can browse and search property cards, view full property details with image slider and seller contacts, and authenticated users can create, edit, and delete their own property listings.

## Live Demo

Production URL:
https://estatehub-real-estate-jimmy.netlify.app

## Tech Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- React Router
- Supabase Auth, Postgres, Storage
- Netlify (hosting and deploy)

## Core Features

- Authentication
  - Register
  - Login
  - Logout

- Public pages
  - Home with latest properties
  - Browse properties with search and pagination
  - Property details page with image slider and seller contact info

- Protected pages
  - My Properties dashboard with pagination
  - Create property with multi-image upload
  - Edit property with add/remove images
  - Delete property with confirmation

- Data and storage
  - Listings persisted in Supabase Postgres
  - Images stored in Supabase Storage bucket listing-photos
  - Row Level Security policies for ownership and access rules

## Project Structure

- [src/pages](src/pages)
- [src/components](src/components)
- [src/lib](src/lib)
- [src/hooks](src/hooks)
- [src/types](src/types)
- [scripts/seed.js](scripts/seed.js)
- [supabase/migrations](supabase/migrations)
- [netlify.toml](netlify.toml)

## Environment Variables

Create a local file named .env.local with:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

Optional for seeding in admin mode:

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project-ref.supabase.co

Note:
The app frontend only needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.

## Local Development

1. Install dependencies
   npm install

2. Start development server
   npm run dev

3. Build for production
   npm run build

## Seed Sample Data

Run:

npm run seed

Seed behavior:

- Creates or reuses users:
  - steve@gmail.com / pass123
  - maria@gmail.com / pass123
- Creates sample for-sale properties per user
- Uploads property photos to Supabase Storage

## Database Migrations

SQL migrations are stored locally in:
[supabase/migrations](supabase/migrations)

Main migrations include:

- Initial schema and RLS setup
- Public read policy for user profiles used in seller contact view

## Netlify Deployment

The project includes Netlify configuration in:
[netlify.toml](netlify.toml)

Current production setup:

- Build command: npm run build
- Publish directory: dist
- SPA redirect to index.html

Required Netlify environment variables (production):

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

## Notes

- A bundle-size warning may appear during build. This does not block deployment.
- If needed, future optimization can add route-level code splitting.
