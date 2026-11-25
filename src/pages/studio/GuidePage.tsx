import { AlertTriangle, ClipboardList, Database, FileJson, Lock, Rocket, Sparkles } from 'lucide-react'
import { Card, CardHeader } from '../../components/studio/ui'

const steps = [
  { title: 'Create the client profile', text: 'Go to “Create New Client” and complete all six sections with the client — ideally on a call. Everything autosaves to this browser once a brand name is entered.' },
  { title: 'Add every product', text: 'Use “Add Product” for each item. Paste direct image URLs (the image must open on its own in a browser tab). Use “Duplicate” for colour variants.' },
  { title: 'Review the preview', text: 'Click “Save & Preview”. Fix any red required items. Amber items are optional — the generated prompt tells Claude not to invent them.' },
  { title: 'Export the files', text: 'Click “Export Client JSON” and “Download Claude Prompt”. Keep both files in the client’s project folder as a record.' },
  { title: 'Build with Claude', text: 'Open a NEW Claude conversation (or Claude Code in a new, empty folder). Paste the prompt (or upload the .txt) and attach the JSON file. Ask Claude to build the complete project.' },
  { title: 'Test & deploy', text: 'Run the project locally, test WhatsApp ordering on a phone, then deploy (GitHub Pages / Netlify / Vercel for static sites).' },
]

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Guide & Workflow</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">How to go from a client conversation to an independent, production-ready website.</p>
      </div>

      <Card>
        <CardHeader title="Step-by-step" icon={<ClipboardList className="h-[18px] w-[18px]" />} />
        <ol className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader title="Giving the files to Claude" icon={<Sparkles className="h-[18px] w-[18px]" />} />
          <div className="space-y-3 p-5 text-sm leading-relaxed text-neutral-600 sm:p-6 dark:text-neutral-300">
            <p><strong>Claude.ai:</strong> start a new chat → paste the copied prompt → attach the <code className="rounded bg-black/5 px-1 dark:bg-white/10">…-client-data.json</code> file → send.</p>
            <p><strong>Claude Code:</strong> create an empty folder named after the client, open Claude Code there, paste the prompt and say “The client JSON is at ./client-data.json” after copying the file into the folder.</p>
            <p>Always use a fresh conversation/folder per client so information never mixes between projects.</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Data storage & privacy" icon={<Lock className="h-[18px] w-[18px]" />} />
          <div className="space-y-3 p-5 text-sm leading-relaxed text-neutral-600 sm:p-6 dark:text-neutral-300">
            <p>Profiles are saved in this browser’s <strong>localStorage</strong>. That means:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>They exist only on this device and this browser profile.</li>
              <li>Clearing browser data or using private mode deletes them.</li>
              <li>It is <strong>not</strong> a secure or multi-user database — anyone using this browser can see them.</li>
            </ul>
            <p>Export JSON regularly as a backup. Never store client passwords, hosting logins or payment card details here.</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Which features need hosting or a backend?" icon={<Database className="h-[18px] w-[18px]" />} />
        <div className="grid gap-6 p-5 text-sm sm:grid-cols-3 sm:p-6">
          <div>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">Static — free hosting</p>
            <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">All pages, catalog, filtering, search, product details, cart (stored in the visitor’s browser), WhatsApp ordering, FAQ & delivery info.</p>
          </div>
          <div>
            <p className="font-semibold text-teal-700 dark:text-teal-400">Partial</p>
            <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">Customer reviews (displaying is static; submissions need a backend) and discount coupons (simple codes are visible in the code; secure codes need a backend).</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400"><AlertTriangle className="h-4 w-4" /> Backend required</p>
            <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">Admin dashboard, stock management, order management, database and payment gateways. These need a database, authentication and paid hosting — quote them separately.</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><FileJson className="h-5 w-5" /></span>
          <div className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p className="font-semibold text-neutral-900 dark:text-white">Moving profiles between computers</p>
            <p className="mt-1">Export JSON on one computer and use “Import Client JSON” on another. Importing never overwrites an existing profile — if the same profile already exists, it is added as a copy marked “(Imported)”.</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><Rocket className="h-5 w-5" /></span>
          <div className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <p className="font-semibold text-neutral-900 dark:text-white">Keep the Studio private</p>
            <p className="mt-1">The Studio ships with the demo storefront at <code className="rounded bg-black/5 px-1 dark:bg-white/10">/#/studio</code>. It is not linked from the storefront navigation, but a static site cannot truly password-protect a route. Because all data stays in your own browser, visitors cannot see your clients — but if you want the tool itself hidden, deploy a separate copy for yourself or remove the footer credit link.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
