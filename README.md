# Khoka Tech — Clothing Website Builder System

Two separate systems in one React project:

| System | URL | Purpose |
| --- | --- | --- |
| **URBAN THREADS storefront** | `/#/` | Premium, fully animated fashion e-commerce demo you show to prospective clients. |
| **Store Admin** | `/#/admin` | Run the URBAN THREADS shop: add, edit, hide or delete products, manage stock, and move orders through Pending → Confirmed → Shipped → Delivered / Cancelled. |
| **Khoka Tech Client Studio** | `/#/studio` | Your private onboarding tool: collect a clothing brand's details, then export a client JSON file and a ready-to-paste Claude development prompt. |

Stack: React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide icons · React Router (hash routing for static hosting). No backend and no paid APIs are needed.

---

## 1. Run the project

Requirements: Node.js 20 or newer.

```powershell
npm install
```

```powershell
npm run dev
```

Open http://localhost:5173 (storefront) and http://localhost:5173/#/studio (Client Studio).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Type-checks and builds the static site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally |
| `npm run typecheck` | TypeScript check only |
| `npm run test:e2e` | Playwright end-to-end tests (desktop 1440px + Pixel 7 mobile) |
| `npm run test:e2e:report` | Opens the last HTML test report |

### Set the WhatsApp number

Copy `.env.example` to `.env` and set `VITE_WHATSAPP_NUMBER` (international format, digits only, e.g. `8801XXXXXXXXX`). Then restart `npm run dev`.

When it's empty, the demo runs in "demo mode": checkout still builds the full order message and opens `https://wa.me/?text=…`, and WhatsApp asks the customer which chat to send it to. Other store settings (delivery charges, free-delivery threshold, address, social links) live in `src/data/storeConfig.ts`.

---

## 2. Project structure

```
├─ .github/workflows/deploy.yml   GitHub Pages deployment (Actions)
├─ .env.example                   WhatsApp number template
├─ index.html
├─ public/favicon.svg
├─ vite.config.ts                 base './' + Tailwind + React
└─ src/
   ├─ App.tsx                     Routes (storefront + lazy-loaded Studio)
   ├─ main.tsx
   ├─ styles/index.css            Tailwind theme, utilities, reduced-motion rules
   ├─ types/
   │  ├─ store.ts                 Product, Category, CartItem, CheckoutDetails
   │  └─ studio.ts                ClientProfile and all onboarding sections
   ├─ data/                       Storefront demo data (URBAN THREADS only)
   │  ├─ storeConfig.ts           WhatsApp number, delivery charges, contact info
   │  ├─ products.ts              17 demo products
   │  ├─ categories.ts
   │  ├─ content.ts               Hero slides, testimonials, FAQ, editorial images
   │  └─ images.ts                Verified Unsplash photo IDs
   ├─ context/
   │  ├─ CartContext.tsx          Cart state (persisted in localStorage)
   │  ├─ StudioContext.tsx        Client profiles CRUD (localStorage)
   │  └─ ToastContext.tsx         Success / error notifications
   ├─ utils/
   │  ├─ whatsapp.ts              Order message, totals, phone validation, wa.me URL
   │  ├─ download.ts              File download, clipboard, file reading
   │  ├─ storage.ts / format.ts
   │  └─ studio/
   │     ├─ defaults.ts           Empty profile, feature catalogue (static vs backend)
   │     ├─ validation.ts         Required / optional checks, completion %
   │     ├─ exportImport.ts       Structured JSON export + tolerant import
   │     └─ prompt.ts             Claude development prompt generator
   ├─ components/
   │  ├─ ui/                      Modal, Drawer, Img, Reveal animations, brand icons
   │  ├─ store/                   Navbar, HeroSlider, ProductCard, CartDrawer, CheckoutModal…
   │  └─ studio/                  Form fields, cards, buttons, export/import actions
   ├─ layouts/
   │  ├─ StoreLayout.tsx
   │  └─ StudioLayout.tsx
   └─ pages/
      ├─ store/                   Home, Shop, Product, Cart, About, Contact, FAQ, 404
      └─ studio/                  Overview, Clients, ClientForm, ClientPreview, Guide
```

---

## 3. The storefront (URBAN THREADS)

- **Home:** announcement bar, sticky transparent-to-solid navbar with animated dropdown and live search panel, cinematic hero slider (clip-path transitions, word-by-word headline, parallax, autoplay with progress bar), category tiles, New Arrivals, store benefits, Featured Collections, Best Sellers carousel, parallax sale banner, brand story, testimonials, newsletter (visual demo only — nothing is stored or sent), footer.
- **Shop:** category filter, search, sort (featured / newest / price / rating), dual-handle price range, on-sale toggle, removable filter chips, mobile filter drawer. Filters live in the URL, so filtered views can be shared.
- **Product details:** image gallery (thumbnails, arrows, swipe), size/color/quantity selectors with validation, Add to Cart with confirmation animation, Buy Now, details & care, related products.
- **Cart:** slide-in drawer and full cart page, quantity changes, remove (with exit animation), free-delivery progress bar, clear-cart confirmation.
- **WhatsApp checkout:** collects name, Bangladeshi phone (validated), address, delivery area and notes; calculates subtotal, delivery (inside/outside Dhaka, free over the threshold) and total; builds a formatted message and opens `https://wa.me/NUMBER?text=ENCODED_MESSAGE`. A confirmation screen offers "Open WhatsApp again" and "Copy message" fallbacks.
- **About, Contact, FAQ, 404** pages.

Animation notes: transform/opacity only, scroll reveals via Framer Motion's Intersection Observer (`whileInView`, once), page transitions, a one-time brand loader per session, scroll progress bar, animated back-to-top button. Everything respects `prefers-reduced-motion`.

---

## 4. Using the Client Studio

Open `/#/studio`. The sidebar has **Overview**, **Client Projects**, **Create New Client** and **Guide & Workflow**. A sun/moon button switches between dark and light themes.

### Create a new client profile

1. Click **Create New Client**.
2. Work through the six sections (the left-hand steps show a red count for missing required items once you save):
   1. **Brand Information:** name, tagline, description, logo URL (with live preview), email, phone, WhatsApp, address, social links.
   2. **Brand Design:** primary/secondary/background colors (with live palette preview), typography, style chips, theme, reference URLs and notes.
   3. **Product Information:** **Add Product** as many times as you need. Each product has name, category (with suggestions), description, regular and discount price, stock, multiple image URLs (with thumbnails), sizes (with presets), colors, SKU, and Featured / New Arrival toggles. You can collapse, duplicate or remove (with confirmation) each product.
   4. **Website Requirements:** 20 feature checkboxes. Features that need a backend are labelled, and a warning explains they need extra hosting and database services.
   5. **Order & Delivery:** WhatsApp order number, delivery charges inside/outside Dhaka, free-delivery threshold, delivery time, return and exchange policies, payment methods, Cash on Delivery.
   6. **Additional Instructions:** special design requests, special features, notes, reference materials, hosting preference, domain information.
3. Work **autosaves** about one second after you stop typing, once a brand name exists. **Save Draft** saves immediately.
4. Click **Save & Preview**.

A profile is marked **Complete** when all required items are filled in: brand name, description, a valid WhatsApp number, valid colors, at least one product with name, category, price and image, delivery charges, and at least one payment method. Otherwise it stays a **Draft**. Optional gaps such as a missing logo or policies show as amber warnings.

### Client preview and export

The preview page shows the brand identity, palette, every product card, requested features (backend ones highlighted), order details, additional notes, a readiness checklist, and the full generated prompt. The buttons are:

| Button | Result |
| --- | --- |
| **Export Client JSON** | Downloads `brand-name-YYYY-MM-DD-client-data.json`: clean, typed data (numbers as numbers, lists as arrays) |
| **Download Claude Prompt** | Downloads `brand-name-YYYY-MM-DD-claude-prompt.txt` |
| **Copy Claude Prompt** | Copies the same prompt to the clipboard |
| **Import Client JSON** | Loads one or more exported files. Never overwrites: if the profile already exists, it's added as "(Imported)" |
| **Edit Client Information** | Opens the form again |

**Client Projects** gives you search (by brand, product, phone or style), Complete/Draft filters, and view, edit, duplicate, export and delete (with confirmation) for each profile.

---

## 5. Giving the prompt and JSON to Claude

The prompt is self-contained: it includes every detail and also embeds the full JSON at the end. Attaching the JSON file as well gives Claude a clean, machine-readable copy.

**Claude.ai:** start a **new** conversation → paste the copied prompt (or upload the `.txt`) → attach the `…-client-data.json` file → send.

**Claude Code:** create a new empty folder for the client (for example `deshi-drip-website`), copy the JSON file into it, open Claude Code in that folder, paste the prompt, and add: *"The client JSON is at ./client-data.json."*

Among other rules, the generated prompt tells Claude to:
- never reuse URBAN THREADS branding or mix in other clients' data
- leave no demo products in the final site
- not invent missing business information (missing items are listed explicitly)
- use the supplied logo, images, prices and colors, and create an original design
- implement working WhatsApp ordering, mobile responsiveness and accessibility
- deliver complete files with setup and deployment instructions
- explain which features need paid hosting or a backend
- not claim any feature works unless it was implemented and tested

### Creating an independent website for a client

Use **one fresh Claude conversation or project folder per client**, and one GitHub repository per client. Never build a client's site inside this repository. This repo is your sales demo and onboarding tool, and the client's site should share no code or data with it.

---

## 6. Deploy the demo to GitHub Pages

The project is ready for static hosting: `base: './'` in Vite and hash-based routes (`/#/shop`), so it works under any repository sub-path and page refreshes never 404.

**Option A — GitHub Actions (recommended):**

1. Create a GitHub repository and push this project to the `main` branch.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. (Optional) Under **Settings → Secrets and variables → Actions → Variables**, add `VITE_WHATSAPP_NUMBER`.
4. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and publishes the site to `https://<username>.github.io/<repo>/`.

**Option B — manual:** run `npm run build` and upload the contents of `dist/` to any static host (Netlify drop, Vercel, cPanel `public_html`, or a `gh-pages` branch).

The Studio is deployed along with the storefront at `/#/studio`. It isn't linked from the storefront menu (only from a small footer credit), and every profile stays in *your* browser, so visitors can't see your clients. A static site can't password-protect a route, though. If you want the tool itself hidden, deploy a separate private copy for yourself and remove the footer link in `src/components/store/Footer.tsx`.

---

## 7. Store Admin panel (`/#/admin`)

**Dashboard:** the number of pending orders, orders in progress, revenue from delivered orders, products in the shop, recent orders and low-stock alerts.

**Products** (`/#/admin/products`):
- **Add Product:** name, category, page URL, description, details, regular and sale price, stock, photos, sizes (with presets), colours (name + swatch), and the badges *New arrival*, *Best seller* and *Featured*. Photos can be image links or uploads from your device; uploads are compressed automatically. Save publishes the product straight to the shop.
- **Edit:** every field. Changes show in the shop immediately.
- **Show / hide:** a hidden product stays in the admin but disappears from the shop, search and its product page.
- **Stock:** adjust it right in the list with − / +. At 0 the shop shows *Sold out* and blocks ordering.
- **Duplicate:** copies a product (hidden until you publish it), useful for colour variants.
- **Delete:** asks for confirmation first.
- **Filters:** All, Visible, Hidden, Low stock and Sold out, plus search and category.

**Orders** (`/#/admin/orders`):
- **Status flow:** **Pending → Confirmed → Shipped → Delivered**. An order can be **Cancelled** (after confirmation) or reopened.
- **Stock is automatic:** it drops when an order is confirmed and comes back if the order is cancelled, returned to Pending or deleted.
- **Order page:** items, customer, totals, history, a private note (e.g. courier tracking), and **Message customer**, which opens WhatsApp with a ready message for the current status.
- **Where orders come from:**
  1. **Website checkout:** the customer's order is recorded as *Pending* automatically, in the browser where it was placed.
  2. **Paste WhatsApp Order:** when a customer orders from their own phone, the order reaches you only as a WhatsApp message. Copy that message, click **Paste WhatsApp Order** and **Read order**: the customer, items, sizes, colours, quantities, prices and notes are filled in, and you click Save. The same order can't be saved twice.
  3. **Add Order:** record phone or walk-in orders by hand.
- **Customer tracking:** customers can follow their order's status on **My Orders** (`/#/orders`, linked in the footer as "Track Your Order").

**Settings** (`/#/admin/settings`):
- The business WhatsApp number, delivery charges (inside and outside Dhaka), the free-delivery threshold and delivery-time text, contact details and social links. Changes apply to the shop immediately.
- **Backup & data:** download a backup, restore from one, reset the products to the demo catalog, delete all orders, or reset the settings.

### What the admin can and cannot do without a backend

This is a static site with no server, so admin data (products, stock, orders, settings) is saved in **the browser you use for the admin**:
- **What works:** everything above, on that browser. The shop in that same browser shows every change. Use one computer or phone for the admin, and download a backup regularly.
- **What doesn't:** product edits made in your admin don't change what other visitors see on their own devices, and orders that customers place on their phones reach you on WhatsApp (record them with **Paste WhatsApp Order**). Two admin devices don't sync, and there's no login, so anyone who opens `/#/admin` in *your* browser can use it.
- **For a live shop shared by every device:** you need a backend, i.e. a database (Supabase, Firebase or PostgreSQL), admin login, and product photo storage. The data layer is in two files (`src/context/CatalogContext.tsx`, `src/context/OrdersContext.tsx`), so they can be switched to a database without changing the admin screens.

## 8. What works statically vs. what needs a backend

| Works on free static hosting (implemented here) | Needs additional hosting / backend (not implemented — labelled in the Studio) |
| --- | --- |
| All pages, catalog, search, filters, sorting | Admin dashboard (login + database) |
| Product details, size/color selection | Real-time stock management |
| Cart (saved in the visitor's browser) | Order storage and order management |
| WhatsApp ordering (message + wa.me link) | Database (e.g. Supabase, Firebase, PostgreSQL) |
| FAQ, delivery information, contact links | Payment gateway (SSLCommerz, bKash merchant API, Stripe) |
| Displaying curated reviews | Customers submitting reviews |
| Simple, publicly visible coupon codes | Secure / single-use coupons |
| Studio profiles in localStorage | Shared multi-user client database, user accounts |
| — | Newsletter sign-up (needs an email service such as Mailchimp) |

### About localStorage (important)

Studio profiles, the cart, and the last checkout name/phone/address are stored in the browser's `localStorage`:
- The data lives only in **that browser on that device**. Another computer or browser won't see it.
- Clearing browsing data, using private mode, or uninstalling the browser **deletes it**.
- It is **not** a secure or multi-user database. Anyone using that browser profile can read it.
- **Export JSON regularly** as a backup and to move profiles between machines.

No customer passwords or payment card details are collected anywhere in this project.

---

## 9. Automated tests (Playwright)

The first time only, install the test browser:

```powershell
npx playwright install chromium
```

Then:

```powershell
npm run test:e2e
```

The tests start their own dev server on port 5199 and cover:

| Area | What is checked |
| --- | --- |
| Storefront | Every page renders with no console errors; the main and mobile menus navigate; the hero can be paused; shop filters, search, sort, price range and shareable filter URLs |
| Product & cart | Size and colour are required; quantity, the gallery, quick view, the cart drawer, quantity change and remove |
| WhatsApp | The exact `wa.me` message: name, phone, area, every item with size, colour, quantity and line total, the free-delivery rule, the total and notes |
| Client Studio | Validation, unlimited products, the Draft/Complete status, the JSON export (contents parsed), the prompt download (required rules present), copying the prompt, the JSON import round-trip, rejecting a bad file, duplicate, search, delete with confirmation, and edits that survive a reload |
| Store Admin | Adding a product with validation, so it appears in the shop with its price, stock and colours; editing a price; selling out at stock 0; hiding and deleting; a website order moving Pending → Confirmed (stock drops) → Shipped → Delivered, as seen on the customer's My Orders page and in the dashboard revenue; cancelling a confirmed order (stock returns); pasting a WhatsApp message to record an order (duplicates blocked); and settings changing the delivery charge at checkout |
| Layout | No sideways scrolling at 390px and 320px on every page; storefront tap targets of at least 44px; content stays visible with reduced motion |

## 10. Design standards applied

The UI follows three public skill guides: **taste-skill** (leonxlnx), **impeccable** (pbakaus) and **Emil Kowalski's animation standards**.
- **Motion:** each page has one entrance on load and at most two "moments" that animate on scroll (home: the sale-banner photo drift and the brand-story image reveal). Nothing else fades in on scroll, and text never moves with the scroll.
- **Timing:** UI motion stays under 300ms with strong ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`). Drawers use an iOS-style curve, and no animation starts from `scale(0)`.
- **Interaction:** every button presses to 0.97, linked cards lift 2px, and photos zoom 1.03 inside their frame. Hover motion runs only on devices with a real pointer.
- **Hero:** the slideshow has a pause button and doesn't autoplay under reduced motion.
- **Honest content:** no invented reviews, ratings or statistics. A "how ordering works" section replaces the testimonials.
- **Layout and styling:** no eyebrow labels above section headings, carousels became grids, and the Studio accent moved from violet/indigo to teal. Text selection, the caret and the scrollbar use the palette.

## 11. Images

Demo photography comes from Unsplash (`images.unsplash.com`), loaded with `auto=format` and responsive widths. Every photo ID in `src/data/images.ts` was checked to load. Images show a shimmer while loading and a graceful fallback if a URL ever fails. Before going live with a real client, replace them with the client's own product photos.
