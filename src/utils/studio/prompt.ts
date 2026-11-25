import type { ClientProfile } from '../../types/studio'
import { toExportObject } from './exportImport'
import { validateProfile } from './validation'

const NP = 'NOT PROVIDED — ask the client; do not invent'
const v = (s: string | number | null | undefined) => (s === null || s === undefined || String(s).trim() === '' ? NP : String(s).trim())
const money = (n: number | null) => (n === null ? NP : `৳${n.toLocaleString('en-IN')} (BDT)`)
const list = (a: string[]) => (a.length ? a.join(', ') : NP)

/**
 * Builds a complete, self-contained development prompt for Claude.
 * Everything Claude needs is inside the prompt — the JSON file is attached as a machine-readable copy.
 */
export function generateClaudePrompt(p: ClientProfile): string {
  const x = toExportObject(p)
  const issues = validateProfile(p)
  const missing = issues.filter((i) => i.level === 'warning' || i.level === 'error').map((i) => `- ${i.message}`)
  const brandName = x.brand.name || 'the client brand'
  const backend = x.features.requiresBackend

  const productBlocks = x.products
    .map((pr, i) =>
      [
        `### Product ${i + 1}: ${v(pr.name)}`,
        `- Category: ${v(pr.category)}`,
        `- SKU: ${pr.sku || 'none'}`,
        `- Regular price: ${money(pr.regularPrice)}`,
        `- Discount price: ${pr.discountPrice === null ? 'none (sell at regular price)' : money(pr.discountPrice)}`,
        `- Stock quantity: ${pr.stock === null ? 'not specified' : pr.stock}`,
        `- Sizes: ${list(pr.sizes)}`,
        `- Colors: ${list(pr.colors)}`,
        `- Featured product: ${pr.featured ? 'YES' : 'no'} · New arrival: ${pr.newArrival ? 'YES' : 'no'}`,
        `- Description: ${v(pr.description)}`,
        `- Image URLs (use exactly these, in this order — first is the main image):`,
        ...(pr.images.length ? pr.images.map((u) => `  - ${u}`) : [`  - ${NP}`]),
      ].join('\n'),
    )
    .join('\n\n')

  return `# DEVELOPMENT BRIEF — ${brandName.toUpperCase()} CLOTHING WEBSITE
Prepared by Khoka Tech Client Studio · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

## YOUR ROLE
Act as a senior professional full-stack developer and premium e-commerce UI/UX designer. Build an entirely NEW, INDEPENDENT, production-ready clothing e-commerce website for the client "${brandName}" using ONLY the client data supplied in this brief (and the attached JSON file, which contains the same data in machine-readable form).

## NON-NEGOTIABLE RULES
1. This is a brand-new project for "${brandName}". NEVER reuse URBAN THREADS branding, copy, logos, product data or imagery. URBAN THREADS is only Khoka Tech's internal demo.
2. Never mix information from any other client or project. Use only the data in this brief.
3. Do NOT leave any demo/sample/placeholder products in the final website. The catalog must contain exactly the ${x.products.length} product(s) listed below.
4. Do NOT invent missing business information (phone numbers, addresses, prices, policies, reviews, social links, statistics). Where something is marked "${NP}", either omit that element gracefully or leave a clearly marked TODO in the code and list it in your final report — never fabricate it.
5. Use the supplied logo, product images, prices and brand colors exactly as given.
6. Create an ORIGINAL design that fits this client's brand and requested style — not a generic template and not a copy of the URBAN THREADS demo.
7. Implement fully functional WhatsApp ordering (details below).
8. The website must be fully responsive (mobile-first) with no horizontal overflow, accessible (labels, alt text, keyboard navigation, focus states, sufficient contrast) and free of console errors.
9. Generate COMPLETE project files — no snippets, no "rest of code here" placeholders.
10. Include clear setup, build and deployment instructions.
11. Clearly explain which requested features need paid hosting, a database or a backend service, and do not fake them.
12. Do NOT claim any feature works unless you have actually implemented and tested it. In your final report, list what was tested and how.
13. Never collect customer passwords or payment card details on the static site.

## 1. BRAND INFORMATION
- Brand name: ${v(x.brand.name)}
- Tagline: ${v(x.brand.tagline)}
- Business description: ${v(x.brand.description)}
- Logo URL: ${x.brand.logoUrl || 'NOT PROVIDED — create a clean text wordmark from the brand name (do not design a fake logo mark)'}
- Brand email: ${v(x.brand.contact.email)}
- Business phone: ${v(x.brand.contact.phone)}
- WhatsApp number: ${v(x.brand.contact.whatsapp)}
- Business address: ${v(x.brand.contact.address)}

### Social links (only show icons for links that are provided)
- Facebook: ${x.brand.social.facebook || 'not provided — omit'}
- Instagram: ${x.brand.social.instagram || 'not provided — omit'}
- TikTok: ${x.brand.social.tiktok || 'not provided — omit'}
- Other: ${x.brand.social.other.length ? x.brand.social.other.join(' | ') : 'none'}

## 2. DESIGN REQUIREMENTS
- Primary color: ${x.design.colors.primary}
- Secondary / accent color: ${x.design.colors.secondary}
- Background color: ${x.design.colors.background}
- Typography preference: ${x.design.typography}
- Design style: ${list(x.design.styles)}
- Website theme: ${x.design.theme}
- Reference websites (for inspiration only — do not copy): ${x.design.referenceWebsites.length ? '\n' + x.design.referenceWebsites.map((u) => `  - ${u}`).join('\n') : 'none provided'}
- Reference design notes: ${x.design.referenceNotes || 'none'}
- Special design requirements: ${x.additional.specialDesignRequirements || 'none'}

Build a cohesive design system from these colors (check text contrast meets WCAG AA; derive tints/shades where needed). Use tasteful, performant animations (transform/opacity, respect prefers-reduced-motion).

## 3. PRODUCT CATALOG (${x.products.length} product${x.products.length === 1 ? '' : 's'} · currency BDT ৳)
${productBlocks}

Product rules:
- Show the discount price as the selling price with the regular price struck through when a discount exists, plus a SALE badge.
- Show a NEW badge on new arrivals; feature "Featured" products on the homepage.
- Only offer the sizes and colors listed for each product. If none are listed, do not show that selector for that product.
- If stock is 0, show "Out of stock" and disable ordering for that product.

## 4. REQUESTED WEBSITE FEATURES
Requested: ${list(x.features.requested)}
Not requested (do not build unless needed for the above): ${list(x.features.notRequested)}
${
  backend.length
    ? `\n### Features that need backend / paid services\n${backend.map((b) => `- ${b.feature} (${b.level === 'backend' ? 'requires backend' : 'static version possible, full version needs backend'}): ${b.note}`).join('\n')}\nFor each of these: explain the required service(s), estimated hosting needs and costs, and either (a) implement it properly with a real backend if feasible, or (b) build the static parts and clearly label the rest as "requires backend integration". Never pretend a backend feature works.`
    : '\nAll requested features can run on a static website (no backend required).'
}

## 5. ORDER & DELIVERY (WhatsApp ordering)
- WhatsApp order number: ${v(x.orderAndDelivery.whatsappOrderNumber)}
- Delivery charge inside Dhaka: ${money(x.orderAndDelivery.deliveryChargeInsideDhaka)}
- Delivery charge outside Dhaka: ${money(x.orderAndDelivery.deliveryChargeOutsideDhaka)}
- Free delivery threshold: ${x.orderAndDelivery.freeDeliveryThreshold === null ? 'none (no free delivery offer)' : money(x.orderAndDelivery.freeDeliveryThreshold)}
- Estimated delivery time: ${v(x.orderAndDelivery.estimatedDeliveryTime)}
- Return policy: ${v(x.orderAndDelivery.returnPolicy)}
- Exchange policy: ${v(x.orderAndDelivery.exchangePolicy)}
- Payment methods: ${list(x.orderAndDelivery.paymentMethods)}
- Cash on Delivery available: ${x.orderAndDelivery.cashOnDelivery ? 'YES' : 'NO'}

WhatsApp checkout must:
1. Collect customer name, phone number (validate Bangladeshi mobile format), delivery address, delivery area (inside/outside Dhaka) and optional order notes.
2. Include every cart item with name, size, color, quantity, unit price and line total.
3. Calculate subtotal, delivery charge (apply the free delivery threshold if provided) and grand total.
4. Generate a clean, readable order message and open: https://wa.me/${x.orderAndDelivery.whatsappOrderNumber || 'WHATSAPP_NUMBER'}?text=ENCODED_MESSAGE (use encodeURIComponent).
5. Keep the WhatsApp number in ONE central config file so it is easy to change.
6. Show a confirmation state with a fallback "Copy message" button.

## 6. ADDITIONAL INSTRUCTIONS
- Special features: ${x.additional.specialFeatures || 'none'}
- Important notes: ${x.additional.importantNotes || 'none'}
- Client reference materials: ${x.additional.clientReferenceMaterials || 'none'}
- Hosting preference: ${x.additional.hostingPreference || 'not specified — recommend a suitable option (static hosting such as GitHub Pages, Netlify or Vercel if no backend is required)'}
- Domain information: ${x.additional.domainInformation || 'not specified'}

## 7. MISSING OR INCOMPLETE INFORMATION
${missing.length ? missing.join('\n') + '\nDo not fabricate any of the above. Handle gracefully and list them in your final report as items to confirm with the client.' : 'None — all key information was provided.'}

## 8. TECHNICAL EXPECTATIONS
- Recommended stack: React + Vite + TypeScript + Tailwind CSS (or another modern stack if better suited — explain why).
- Clean, reusable components; organised folders (components, pages, data, utils, hooks, types).
- All product data in one data file generated from this brief.
- SEO basics: page titles, meta description, Open Graph tags, semantic HTML, alt text for every image.
- Performance: lazy-load images, avoid layout shift, keep bundles small.
- Persist the cart in localStorage.
- Pages: include every requested page (Homepage, Shop/Catalog, Product Details, Cart, and others listed above). No broken links, no empty sections, no lorem ipsum.

## 9. DELIVERABLES
1. Complete project source code (every file).
2. README with: setup, local development, build, deployment steps (including hosting/domain notes), and how to change the WhatsApp number, products and colors.
3. A final report listing: implemented features, what was tested and how, features requiring backend/paid services, and any missing client information still to be confirmed.

---
The attached file (client JSON) contains this same data in structured form. If the brief and the JSON ever disagree, ask before proceeding.

## CLIENT DATA (JSON)
\`\`\`json
${JSON.stringify(x, null, 2)}
\`\`\`
`
}
