import { Download, RotateCcw, Save, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { ConfirmDialog } from '../../components/studio/actions'
import { Button, Card, CardHeader, TextField } from '../../components/studio/ui'
import { useCatalog } from '../../context/CatalogContext'
import { useOrders } from '../../context/OrdersContext'
import { useToast } from '../../context/ToastContext'
import { defaultSettings, resetStoreSettings, saveStoreSettings, storeConfig, type StoreSettings } from '../../data/storeConfig'
import type { Order, Product } from '../../types/store'
import { downloadText, readFileAsText } from '../../utils/download'
import { PageHeader } from './shared'

const BACKUP_SCHEMA = 'urban-threads/store-backup'

export default function AdminSettings() {
  const { allProducts, replaceCatalog, resetCatalog } = useCatalog()
  const { orders, replaceOrders } = useOrders()
  const { notify } = useToast()
  const [s, setS] = useState<StoreSettings>(() => JSON.parse(JSON.stringify(storeConfig)))
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState<null | 'reset-catalog' | 'clear-orders' | 'reset-settings'>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const setD = (k: keyof StoreSettings['delivery'], v: string) => setS((p) => ({ ...p, delivery: { ...p.delivery, [k]: k === 'estimate' ? v : (v as unknown as number) } }))
  const setSocial = (k: keyof StoreSettings['social'], v: string) => setS((p) => ({ ...p, social: { ...p.social, [k]: v } }))

  const wa = s.whatsappNumber.replace(/\D/g, '')
  const errors: Record<string, string> = {}
  if (wa && (wa.length < 10 || wa.length > 15)) errors.wa = 'Use 10–15 digits in international format, e.g. 8801XXXXXXXXX.'
  ;(['insideDhaka', 'outsideDhaka', 'freeThreshold'] as const).forEach((k) => {
    const n = Number(s.delivery[k])
    if (String(s.delivery[k]).trim() === '' || !Number.isFinite(n) || n < 0) errors[k] = 'Enter an amount (0 or more).'
  })
  const err = (k: string) => (tried ? errors[k] : undefined)

  const save = () => {
    setTried(true)
    if (Object.keys(errors).length) return notify('error', 'Please fix the highlighted fields')
    const next: StoreSettings = {
      ...s,
      whatsappNumber: wa,
      delivery: { ...s.delivery, insideDhaka: Number(s.delivery.insideDhaka), outsideDhaka: Number(s.delivery.outsideDhaka), freeThreshold: Number(s.delivery.freeThreshold) },
    }
    if (saveStoreSettings(next)) notify('success', 'Settings saved', 'The shop uses them right away.')
    else notify('error', 'Could not save', 'Browser storage is full or blocked.')
  }

  const exportBackup = () => {
    const data = { schema: BACKUP_SCHEMA, exportedAt: new Date().toISOString(), settings: storeConfig, products: allProducts, orders }
    downloadText(`urban-threads-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json')
    notify('success', 'Backup downloaded', `${allProducts.length} products and ${orders.length} orders.`)
  }

  const importBackup = async (f: File | undefined) => {
    if (!f) return
    try {
      const data = JSON.parse(await readFileAsText(f)) as { schema?: string; settings?: StoreSettings; products?: Product[]; orders?: Order[] }
      if (data.schema !== BACKUP_SCHEMA || !Array.isArray(data.products) || !Array.isArray(data.orders)) throw new Error('This is not an URBAN THREADS store backup file.')
      if (data.products.some((p) => !p.id || !p.slug || !p.name || !Array.isArray(p.images))) throw new Error('The backup contains invalid products.')
      replaceCatalog(data.products)
      replaceOrders(data.orders)
      if (data.settings) {
        saveStoreSettings(data.settings)
        setS(JSON.parse(JSON.stringify(storeConfig)))
      }
      notify('success', 'Backup restored', `${data.products.length} products and ${data.orders.length} orders.`)
    } catch (e) {
      notify('error', 'Restore failed', e instanceof SyntaxError ? 'The file is not valid JSON.' : e instanceof Error ? e.message : 'Unknown error')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <>
      <PageHeader title="Settings" sub="Ordering, delivery and contact details used across the shop." actions={<Button variant="primary" className="h-11 !bg-ink hover:!bg-ink-3" icon={<Save className="h-4 w-4" />} onClick={save}>Save Settings</Button>} />

      <div className="space-y-6">
        <Card>
          <CardHeader title="WhatsApp ordering" />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <TextField label="Business WhatsApp number" value={s.whatsappNumber} onChange={(e) => setS({ ...s, whatsappNumber: e.target.value })} error={err('wa')} placeholder="8801XXXXXXXXX" hint="Orders are sent here. Leave empty to let customers pick the chat (demo mode)." />
          </div>
        </Card>

        <Card>
          <CardHeader title="Delivery" />
          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
            <TextField label="Inside Dhaka (৳)" inputMode="numeric" value={String(s.delivery.insideDhaka)} onChange={(e) => setD('insideDhaka', e.target.value)} error={err('insideDhaka')} />
            <TextField label="Outside Dhaka (৳)" inputMode="numeric" value={String(s.delivery.outsideDhaka)} onChange={(e) => setD('outsideDhaka', e.target.value)} error={err('outsideDhaka')} />
            <TextField label="Free delivery from (৳)" inputMode="numeric" value={String(s.delivery.freeThreshold)} onChange={(e) => setD('freeThreshold', e.target.value)} error={err('freeThreshold')} />
            <TextField className="sm:col-span-3" label="Delivery time text" value={s.delivery.estimate} onChange={(e) => setD('estimate', e.target.value)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Contact & social" />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <TextField label="Email" type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
            <TextField label="Opening hours" value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} />
            <TextField className="sm:col-span-2" label="Address" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} />
            <TextField label="Facebook URL" type="url" value={s.social.facebook} onChange={(e) => setSocial('facebook', e.target.value)} />
            <TextField label="Instagram URL" type="url" value={s.social.instagram} onChange={(e) => setSocial('instagram', e.target.value)} />
            <TextField label="YouTube URL" type="url" value={s.social.youtube} onChange={(e) => setSocial('youtube', e.target.value)} />
            <TextField label="TikTok URL" type="url" value={s.social.tiktok} onChange={(e) => setSocial('tiktok', e.target.value)} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Backup & data" description="Admin data is stored in this browser. Download a backup regularly, and use it to move your products and orders to another computer." />
          <div className="flex flex-wrap gap-2 p-5 sm:p-6">
            <Button className="h-11" icon={<Download className="h-4 w-4" />} onClick={exportBackup}>Download backup</Button>
            <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => importBackup(e.target.files?.[0])} />
            <Button className="h-11" icon={<Upload className="h-4 w-4" />} onClick={() => fileInput.current?.click()}>Restore from backup</Button>
            <Button variant="ghost" className="h-11 text-red-700 hover:!bg-red-50" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirm('reset-catalog')}>Reset products to demo</Button>
            <Button variant="ghost" className="h-11 text-red-700 hover:!bg-red-50" onClick={() => setConfirm('clear-orders')}>Delete all orders</Button>
            <Button variant="ghost" className="h-11" onClick={() => setConfirm('reset-settings')}>Reset settings</Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm === 'reset-catalog' ? 'Reset products to the demo catalog?' : confirm === 'clear-orders' ? 'Delete all orders?' : 'Reset settings to defaults?'}
        body={
          confirm === 'reset-catalog'
            ? 'All your product changes, new products and stock levels are replaced with the original demo products. Download a backup first if you may need them.'
            : confirm === 'clear-orders'
              ? `All ${orders.length} orders are permanently deleted. Stock is not changed. Download a backup first if you may need them.`
              : 'WhatsApp number, delivery charges and contact details return to their defaults.'
        }
        confirmLabel={confirm === 'reset-settings' ? 'Reset settings' : confirm === 'clear-orders' ? 'Delete all orders' : 'Reset products'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'reset-catalog') resetCatalog()
          if (confirm === 'clear-orders') replaceOrders([])
          if (confirm === 'reset-settings') {
            resetStoreSettings()
            setS(defaultSettings())
          }
          notify('success', 'Done')
          setConfirm(null)
        }}
      />
    </>
  )
}
