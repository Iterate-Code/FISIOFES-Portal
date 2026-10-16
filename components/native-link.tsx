import type { AnchorHTMLAttributes, ReactNode } from 'react'

type NativeLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children?: ReactNode
}

/**
 * Uses native browser navigation. This avoids Vinext's currently broken
 * next/link client-side router while preserving the existing Link call sites.
 */
export default function NativeLink({ href, children, ...props }: NativeLinkProps) {
  return <a href={href} {...props}>{children}</a>
}
