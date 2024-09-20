import { forwardRef } from 'react'

export const TrashIcon = forwardRef<SVGSVGElement>((props, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="#7B829F"
        fillRule="evenodd"
        d="M4.45 9.184C3.236 7.564 4.393 5.25 6.419 5.25h11.164c2.026 0 3.183 2.313 1.967 3.934a3.997 3.997 0 00-.799 2.398V18A4.75 4.75 0 0114 22.75h-4A4.75 4.75 0 015.25 18v-6.418c0-.865-.28-1.706-.8-2.398zM6.419 6.75a.959.959 0 00-.767 1.534 5.497 5.497 0 011.099 3.298V18A3.25 3.25 0 0010 21.25h4A3.25 3.25 0 0017.25 18v-6.418c0-1.19.386-2.346 1.1-3.298a.959.959 0 00-.768-1.534H6.418z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#7B829F"
        fillRule="evenodd"
        d="M14 10.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zM10 10.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zM7.833 4.13a2.75 2.75 0 012.608-1.88h3.117a2.75 2.75 0 012.61 1.88l.544 1.633a.75.75 0 11-1.423.474l-.545-1.632a1.25 1.25 0 00-1.185-.855h-3.117a1.25 1.25 0 00-1.186.855l-.544 1.632a.75.75 0 11-1.423-.474l.544-1.633z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
})
TrashIcon.displayName = 'TrashIcon'
