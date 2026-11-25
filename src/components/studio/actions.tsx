import { Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOptionalStudio, useStudio } from '../../context/StudioContext'
import { useToast } from '../../context/ToastContext'
import type { ClientProfile } from '../../types/studio'
import { copyText, downloadText, readFileAsText } from '../../utils/download'
import { exportFileBase, ImportError, parseImport, toExportJson } from '../../utils/studio/exportImport'
import { generateClaudePrompt } from '../../utils/studio/prompt'
import { Modal } from '../ui/Modal'
import { Button } from './ui'

export function StudioModal(props: Parameters<typeof Modal>[0]) {
  const studio = useOptionalStudio()
  return <Modal {...props} tone={studio?.theme === 'dark' ? 'dark' : 'light'} />
}

/** Export / prompt helpers with user feedback. */
export function useProfileExport() {
  const { notify } = useToast()
  return {
    exportJson: (p: ClientProfile) => {
      downloadText(`${exportFileBase(p)}-client-data.json`, toExportJson(p), 'application/json')
      notify('success', 'Client JSON exported', `${exportFileBase(p)}-client-data.json`)
    },
    downloadPrompt: (p: ClientProfile) => {
      downloadText(`${exportFileBase(p)}-claude-prompt.txt`, generateClaudePrompt(p))
      notify('success', 'Claude prompt downloaded', `${exportFileBase(p)}-claude-prompt.txt`)
    },
    copyPrompt: async (p: ClientProfile) => {
      const ok = await copyText(generateClaudePrompt(p))
      if (ok) notify('success', 'Claude prompt copied', 'Paste it into a new Claude conversation.')
      else notify('error', 'Copy failed', 'Your browser blocked clipboard access — use "Download prompt" instead.')
    },
  }
}

/** Button that opens a file picker and imports one or more client JSON files. */
export function ImportJsonButton({ variant = 'secondary', label = 'Import Client JSON', size }: { variant?: 'primary' | 'secondary' | 'ghost'; label?: string; size?: 'sm' | 'md' }) {
  const input = useRef<HTMLInputElement>(null)
  const { importProfiles } = useStudio()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const all: ClientProfile[] = []
      for (const f of Array.from(files)) {
        if (f.size > 5_000_000) throw new ImportError(`${f.name} is larger than 5 MB.`)
        all.push(...parseImport(await readFileAsText(f)))
      }
      const imported = importProfiles(all)
      notify('success', `Imported ${imported.length} client profile${imported.length === 1 ? '' : 's'}`, imported.map((p) => p.brand.brandName || 'Untitled').join(', '))
      if (imported.length === 1) navigate(`/studio/client/${imported[0].id}`)
      else navigate('/studio/clients')
    } catch (e) {
      notify('error', 'Import failed', e instanceof ImportError ? e.message : 'The file could not be read as a client profile.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <input ref={input} type="file" accept="application/json,.json" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => onFiles(e.target.files)} />
      <Button variant={variant} size={size} icon={<Upload className="h-4 w-4" />} onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Importing…' : label}
      </Button>
    </>
  )
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <StudioModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} data-autofocus>{confirmLabel}</Button>
        </div>
      }
    >
      <div className="text-sm text-neutral-600 dark:text-neutral-300">{body}</div>
    </StudioModal>
  )
}
