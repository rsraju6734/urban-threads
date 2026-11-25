import { Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { storeConfig } from '../../data/storeConfig'
import { formatBDT } from '../../utils/format'
import { SocialLinks } from './SocialLinks'

export function AnnouncementBar() {
  const msg = `Free Delivery on orders over ${formatBDT(storeConfig.delivery.freeThreshold)}`
  return (
    <div className="relative z-50 bg-ink text-[11px] text-white/85">
      <div className="container-x flex h-9 items-center justify-between gap-4">
        <p className="flex min-w-0 items-center gap-2 truncate">
          <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {msg}
            <span className="mx-2 text-white/40">|</span>
            <Link to="/shop?sort=new" className="link-underline hover:text-white">
              Shop the Latest Collection!
            </Link>
          </span>
        </p>
        <SocialLinks className="hidden sm:flex" iconClass="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
