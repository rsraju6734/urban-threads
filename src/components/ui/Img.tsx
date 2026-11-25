import { useState, type ImgHTMLAttributes } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../utils/format'

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** classes for the wrapping element (controls size / aspect ratio) */
  wrapClassName?: string
}

/** Image with a shimmer skeleton, a soft fade-in and a graceful fallback if the URL fails. */
export function Img({ src, alt, className, wrapClassName, loading = 'lazy', ...rest }: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  return (
    <div className={cn('relative overflow-hidden', wrapClassName)}>
      {state === 'loading' && <div className="img-skeleton absolute inset-0" aria-hidden />}
      {state === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cream text-stone">
          <ImageOff className="h-6 w-6" aria-hidden />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn(
            'h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)]',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  )
}
