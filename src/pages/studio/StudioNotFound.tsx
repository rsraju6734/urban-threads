import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, EmptyState } from '../../components/studio/ui'

export default function StudioNotFound({ title = 'Page not found', text = 'This Studio page does not exist.' }: { title?: string; text?: string }) {
  return (
    <Card>
      <EmptyState
        icon={<SearchX className="h-6 w-6" />}
        title={title}
        text={text}
        action={<Link to="/studio/clients" className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-600">Go to client projects</Link>}
      />
    </Card>
  )
}
