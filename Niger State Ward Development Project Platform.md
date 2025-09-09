Build a production ready Niger State Ward Development Project Platform using Next.js and Supabase. Follow all instructions exactly. Ship clean, maintainable, and secure code.

Goals

* Citizens view and search projects across 274 wards

* Authorized publishers submit projects scoped to their LG and Ward using passcodes

* Admins moderate and manage data

* Users subscribe for quarterly reports

* Users report issues and comment on projects with admin moderation

* Fast, secure, accessible, mobile first

Tech Stack

* Next.js 14 with App Router, TypeScript, React Server Components

* Tailwind CSS, shadcn UI, lucide icons, Framer Motion for light animations

* Supabase Postgres, Auth, Storage, Edge Functions

* Zod for validation, React Hook Form, TanStack Query for client data fetching

* Resend or SMTP for email

* Day.js for dates

* Map tiles optional later, keep pluggable

Environments and Secrets

* NEXT\_PUBLIC\_SITE\_URL

* NEXT\_PUBLIC\_SUPABASE\_URL

* SUPABASE\_SERVICE\_ROLE\_KEY

* NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY

* ADMIN\_SEED\_EMAIL

* ADMIN\_SEED\_PASSWORD

* RESEND\_API\_KEY or SMTP credentials

* VERCEL\_KV\_REST\_API\_URL and VERCEL\_KV\_REST\_API\_TOKEN if used

* SENTRY\_DSN

Data Model

* lgas

  * id uuid pk

  * name text unique not null

* wards

  * id uuid pk

  * lga\_id uuid fk lgas

  * name text not null

  * unique lga\_id plus name

* polling\_units

  * id uuid pk

  * ward\_id uuid fk wards

  * name text not null

  * code text

  * unique ward\_id plus name

* users

  * id uuid pk references auth.users

  * full\_name text

  * phone\_whatsapp text

  * phone\_call text

  * email text unique

  * role text enum super\_admin admin publisher citizen default citizen

  * lga\_id uuid nullable

  * ward\_id uuid nullable

  * created\_at timestamptz default now

* publisher\_passcodes

  * id uuid pk

  * code text unique hashed at rest using pgcrypto

  * lga\_id uuid not null

  * ward\_id uuid not null

  * expires\_at timestamptz

  * max\_uses int default 1

  * used\_count int default 0

  * active boolean default true

  * created\_by uuid fk users

* projects

  * id uuid pk

  * title text not null

  * description text

  * lga\_id uuid fk lgas

  * ward\_id uuid fk wards

  * polling\_unit\_id uuid fk polling\_units nullable

  * status text enum planned ongoing completed

  * budget\_naira numeric nullable

  * contractor text nullable

  * start\_date date nullable

  * end\_date date nullable

  * latitude numeric nullable

  * longitude numeric nullable

  * created\_by uuid fk users nullable

  * approval\_status text enum pending approved rejected default pending

  * rejection\_reason text nullable

  * created\_at timestamptz default now

  * updated\_at timestamptz default now

  * published\_at timestamptz nullable

* project\_images

  * id uuid pk

  * project\_id uuid fk projects

  * storage\_path text not null

  * caption text

  * sort\_order int default 0

  * created\_at timestamptz default now

* project\_status\_history

  * id uuid pk

  * project\_id uuid

  * old\_status text

  * new\_status text

  * changed\_by uuid fk users

  * changed\_at timestamptz default now

* subscriptions

  * id uuid pk

  * full\_name text not null

  * lga\_id uuid not null

  * ward\_id uuid not null

  * polling\_unit\_id uuid not null

  * address text

  * phone\_whatsapp text

  * phone\_call text not null

  * email text not null

  * traits jsonb not null array of tags selected

  * status text enum active rejected unsubscribed default active

  * created\_at timestamptz default now

  * unique email or phone\_call enforce both uniqueness

* comments

  * id uuid pk

  * project\_id uuid fk projects

  * author\_name text

  * content text not null

  * created\_at timestamptz default now

  * approval\_status text enum pending approved rejected default pending

  * rejection\_reason text nullable

  * created\_by uuid fk users nullable

* reports

  * id uuid pk

  * project\_id uuid fk projects

  * reporter\_name text

  * reporter\_email text nullable

  * reporter\_phone text nullable

  * message text not null

  * status text enum new in\_review resolved rejected default new

  * created\_at timestamptz default now

  * created\_by uuid fk users nullable

* audit\_logs

  * id uuid pk

  * actor\_id uuid fk users nullable

  * action text

  * entity text

  * entity\_id uuid

  * meta jsonb

  * created\_at timestamptz default now

* rate\_limits

  * id uuid pk

  * key text

  * window\_starts\_at timestamptz

  * count int

Indexes

* projects gin index on to\_tsvector for title and description

* projects btree on ward\_id lga\_id status approval\_status created\_at

* comments project\_id approval\_status

* subscriptions unique on lower(email) and normalized phone

* publisher\_passcodes active plus ward\_id plus lga\_id

* trigram gin on projects.title for suggestions

Supabase Storage

* bucket project-images public read

* server side upload with size and type validation

* image optimization via Next Image

Auth and Roles

* Supabase email plus OTP optional

* Roles in users table

  * super\_admin global

  * admin scoped to one or more LGs

  * publisher scoped to one LG and Ward via passcode claim

  * citizen default

* Session hydrates role and scope in JWT via trigger

Row Level Security

* Enable RLS on all tables

* Public read

  * projects where approval\_status is approved

  * project\_images where project is approved

  * comments where approval\_status is approved

* Restricted read

  * pending or rejected visible to admins and creators

* Write rules

  * publishers can insert projects only if their scope matches lga\_id and ward\_id

  * comments insert allowed to authenticated and anonymous via Edge Function with captcha

  * subscriptions insert allowed to anonymous via Edge Function with captcha

  * reports insert allowed to anonymous via Edge Function with captcha

  * only admins can update approval\_status or delete

* Log all writes to audit\_logs

Seed and Admin Bootstrapping

* Write a SQL migration that

  * creates enums

  * creates all tables

  * enables RLS with policies

  * seeds LGAs, Wards, Polling Units from CSV

  * creates initial super\_admin using ADMIN\_SEED\_EMAIL and ADMIN\_SEED\_PASSWORD

  * creates default buckets and policies

* Add a CLI script

  * node scripts/seed-admin.ts

  * verifies admin creation and rotates password if needed

Passcode Flow for Publishers

* Admin creates passcode tied to an LG and Ward

* Code is hashed and stored

* Publisher uses passcode once to elevate and bind their account to that LG and Ward

* used\_count increments and max\_uses enforced

* expired or inactive codes rejected

* Audit every attempt

Pages and Routes

* Public

  * Home with hero slider of four images auto slide every 2 seconds

  * Latest projects section shows 30 most recent approved projects

    * show 3 at a time cycle every 5 seconds

  * Track Projects page

    * Select LG then Ward then search

    * List all approved projects for that ward

  * Projects index with filters

    * LG

    * Ward

    * Year

    * Month

    * Status

    * Text search with suggestion

  * Project detail

    * title, status, location, dates, budget, contractor

    * gallery

    * status timeline

    * submit report form

    * comments section with pending moderation

* Auth

  * Sign in, Sign up, OTP if enabled

  * Publisher claim passcode page

* Publish

  * Gated by role publisher or admin

  * Form fields

    * title

    * description

    * LG

    * Ward

    * Polling Unit

    * status

    * budget

    * contractor

    * dates

    * location

    * photos upload up to 10

  * On submit create project with approval\_status pending

* Subscribe for Quarterly Report

  * Form with all specified fields

  * Validate duplicates on email or phone\_call

  * Store traits list

  * Send confirmation email

* Admin Panel

  * Dashboard metrics

    * pending projects

    * pending comments

    * new reports

    * subscriptions growth

  * Projects moderation

    * approve or reject with reason

    * edit metadata

    * manage images

    * change status and log history

  * Comments moderation

    * approve, reject, delete

  * Reports triage

    * set status

    * reply via email

  * Passcodes

    * create, revoke, list usage

  * Taxonomy

    * manage LGAs, Wards, Polling Units

  * Users

    * assign roles and scopes

  * Exports

    * CSV for projects, subscriptions, reports

  * Audit logs viewer

APIs and Edge Functions

* Next.js route handlers with server actions for authenticated operations

* Edge Function submit\_comment

  * rate limit by IP and project

  * captcha check

  * insert as pending

* Edge Function submit\_report

  * rate limit and captcha

* Edge Function subscribe\_quarterly

  * dedupe by email and phone

  * reject if either exists

* Edge Function search\_suggest

  * uses trigram similarity on projects.title

* Webhooks

  * On approval of project trigger cache revalidation

  * On comment approval trigger cache revalidation

  * On new subscription send welcome email

Validation

* Zod schemas for all forms

* Strong server side validation

* Normalize phone numbers to E164

* Lowercase and trim emails

* File size and type checks on upload

Caching and Performance

* Use ISR for public pages

  * Home revalidate 60 seconds

  * Projects index revalidate 60 seconds with search parameters in cache key

  * Project detail revalidate 60 seconds

* Edge caching for static assets

* Database pagination with keyset where possible

* Use select and count estimates for large lists

* Add API response caching for suggestions

Search

* Full text search on title and description

* Trigram suggestions for query assist

* Filters combine with search safely

* Push down filters to SQL with RLS safe views

Rate Limiting

* Vercel KV or Upstash Redis

* Sliding window per IP for comments, reports, subscriptions

* Admin actions exempt

Security

* CSP with Next headers

* Strict HTTPS

* Protect secrets with server only code

* Supabase RLS everywhere

* Avoid client side service role

* Signed URLs for images on upload

* Limit file types to images jpg png webp

* CSRF safe since using route handlers and same site cookies

* Brute force protection using rate limits

Accessibility and UX

* Keyboard navigable components

* Form errors with inline messages

* Loading states and skeletons

* Empty states

* Toasts for success and failure

* Clear copy in Nigerian English where possible

Hero Slider

* Four images cycle every 2 seconds

* Pause on hover

* Lazy load images

* Next Image component

Latest Projects Carousel

* Load 30 most recent approved

* Show 3 cards at a time

* Auto advance every 5 seconds

* Pause on hover

* Click goes to project detail

Track Projects Flow

* User selects LG

* Load Wards for that LG

* User selects Ward

* Show projects list with pagination

* SSR for first load then client side paginate

Publish Projects Flow

* Auth required

* If publisher role absent

  * show passcode claim

  * on success bind user to LG and Ward

* Show publish form scoped to user LG and Ward

* Submit to create pending project

* Notify admins

Comments Flow

* Public form

* Captcha

* Pending moderation

* Admin approve or reject

* Show only approved

Reports Flow

* Public form on project page

* Captcha and rate limit

* Admin triage

Subscriptions Flow

* Public form

* Reject if email exists

* Reject if phone\_call exists

* Save and send confirmation

Admin Actions Expanded

* Create publisher passcode

  * choose LG and Ward

  * set max uses and expiry

  * revoke or deactivate

* Approve project

  * sets approval\_status approved

  * sets published\_at

  * triggers revalidate

* Reject project

  * set rejection\_reason

  * notify creator

* Edit project

  * any field

  * status changes write to history

* Manage images

  * upload, reorder, delete

* Moderate comments

  * approve, reject with reason

* Handle reports

  * set status

  * write resolution note

  * notify reporter if email exists

* Manage users

  * assign role and scopes

  * reset password via magic link

* Manage taxonomy

  * add or fix LG, Ward, Polling Unit

* Exports

  * CSV by filter and date range

* Audit review

  * searchable logs

Migrations and Seeds

* SQL migrations for schema and policies

* Script to import LGAs, Wards, Polling Units from provided CSVs

* Seed super admin using ADMIN\_SEED\_EMAIL and ADMIN\_SEED\_PASSWORD

* Seed sample images optional

UI Components

* HeroSlider

* ProjectCard

* ProjectCarousel

* FiltersBar with LG, Ward, Year, Month, Status

* SearchBox with suggestions

* ProjectForm

* ImageUploader with Supabase storage

* CommentForm

* ReportForm

* SubscriptionForm

* DataTable with pagination and sorting for admin

* PasscodeForm

* RoleBadge

* StatusBadge

* ApproveRejectDialog

Testing

* Unit tests for utilities and policies

* E2E for critical flows using Playwright

* Test RLS with Supabase client using service role in tests only

Analytics

* Track page views and form conversions

* Track search queries and no result events

Observability

* Sentry for Next.js and Edge Functions

* Structured logs for Edge Functions

* Alert on function failures

Deployment

* Deploy frontend to Vercel

* Link to Supabase project

* Run migrations on deploy

* Set environment variables

* Enable image optimization domains

Accept Criteria

* Public can browse and search approved projects

* Hero and latest sections auto rotate as specified

* Publishers can submit projects within scope

* Admin can moderate projects, comments, reports

* Subscriptions enforce duplicate checks

* Comments and reports require moderation

* RLS prevents unauthorized access

* Pages load fast on mobile and desktop

* All forms validate on client and server

* Cache revalidation works after moderation

Deliverables

* Monorepo or single Next.js app with app directory

* Supabase SQL migrations and seed scripts

* Admin seeding script and instructions

* README with setup steps and environment variables

* CI pipeline for type check, lint, tests, build

* Sentry and logging configured

* Sample CSVs for LGAs, Wards, Polling Units

Build Instructions for the AI

* Scaffold Next.js 14 with TypeScript and Tailwind

* Install shadcn UI and set up theme

* Initialize Supabase client server and client helpers

* Create all DB objects and RLS policies by migration

* Implement auth and role bootstrap

* Build public pages first

* Build forms with Zod and React Hook Form

* Add Edge Functions for public writes and captcha

* Build admin panel with protected routes and role checks

* Add caching and revalidate hooks

* Add tests and CI

* Seed admin account using ADMIN\_SEED\_EMAIL and ADMIN\_SEED\_PASSWORD on first run

* Output migration and seed logs

* Deliver production build ready for Vercel

Admin credentials initiation

* On first deploy run seed script

* Create super admin using ADMIN\_SEED\_EMAIL and ADMIN\_SEED\_PASSWORD

* Force password change on first login

* Create an admin scoped to each LGA optional

* Log created users to audit with masked email

Non functional requirements

* TTFB under 200 ms for cached pages

* Core Web Vitals green

* P99 API under 500 ms

* Error rate under 1 percent

* 99.9 percent uptime target  
