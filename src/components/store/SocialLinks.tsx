import { storeConfig } from '../../data/storeConfig'
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from '../ui/BrandIcons'
import { cn } from '../../utils/format'

const getLinks = () => [
  { label: 'Facebook', href: storeConfig.social.facebook, Icon: FacebookIcon },
  { label: 'Instagram', href: storeConfig.social.instagram, Icon: InstagramIcon },
  { label: 'YouTube', href: storeConfig.social.youtube, Icon: YoutubeIcon },
  { label: 'TikTok', href: storeConfig.social.tiktok, Icon: TiktokIcon },
]

export function SocialLinks({ className, iconClass = 'h-4 w-4', itemClass }: { className?: string; iconClass?: string; itemClass?: string }) {
  const links = getLinks()
  return (
    <ul className={cn('flex items-center gap-3', className)}>
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`URBAN THREADS on ${label}`}
            className={cn('block transition duration-300 hover:-translate-y-0.5 hover:opacity-70', itemClass)}
          >
            <Icon className={iconClass} />
          </a>
        </li>
      ))}
    </ul>
  )
}
