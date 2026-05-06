import type { SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'calendar'
  | 'chart'
  | 'heart'
  | 'settings'
  | 'bell'
  | 'users'
  | 'shield'
  | 'leaf'
  | 'copy'
  | 'kakao'
  | 'wallet'
  | 'info'
  | 'check'
  | 'mountain'
  | 'mail'
  | 'plus'
  | 'lock'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-right'
  | 'share'
  | 'refresh'
  | 'history'
  | 'analyze'
  | 'sparkle'

type IconProps = SVGProps<SVGSVGElement> & { name: IconName }

export function Icon({ name, className, ...props }: IconProps) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
    ...props,
  }

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M10 20v-6h4v6" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <path d="M8 2v4M16 2v4" />
          <path d="M4 7h16" />
          <path d="M5 4h14a1 1 0 0 1 1 1v15H4V5a1 1 0 0 1 1-1Z" />
          <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01" />
        </svg>
      )
    case 'chart':
    case 'analyze':
      return (
        <svg {...common}>
          <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="16" cy="11" r="2.5" />
          <path d="M3 19c0-2.5 2.5-4 6-4s6 1.5 6 4M14 19c0-1.8 1.5-3 4-3s4 1.2 4 3" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M12 21V10" />
          <path d="M12 15c-4-.4-6.7-3.1-7-7.2 4.2.2 6.8 2.2 7.3 6" />
          <path d="M12.4 13.6c.6-5 3.7-8 8.6-8.6-.2 5.1-3.2 8-8.4 8.6" />
        </svg>
      )
    case 'copy':
      return (
        <svg {...common}>
          <path d="M8 8h12v12H8z" />
          <path d="M4 16V4h12" />
        </svg>
      )
    case 'kakao':
      return (
        <svg {...common}>
          <path d="M12 5C7 5 3 8 3 11.7c0 2.4 1.7 4.5 4.2 5.7L6.5 21l3.7-2.1c.6.1 1.2.1 1.8.1 5 0 9-3 9-6.7S17 5 12 5Z" />
        </svg>
      )
    case 'wallet':
      return (
        <svg {...common}>
          <path d="M19 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5" />
          <path d="M16 13h.01" />
        </svg>
      )
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )
    case 'mountain':
      return (
        <svg {...common}>
          <path d="m3 19 7-11 4 6 2-3 5 8H3Z" />
          <path d="m10 8 1.5 2" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <path d="M4 5h16v14H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <path d="M6 10V8a6 6 0 1 1 12 0v2" />
          <rect x="5" y="10" width="14" height="11" rx="1" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      )
    case 'chevron-left':
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <path d="M4 12v8h16v-8" />
          <path d="M12 3v13" />
          <path d="m7 8 5-5 5 5" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </svg>
      )
    case 'history':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          <path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5L12 8z" />
        </svg>
      )
  }
}
