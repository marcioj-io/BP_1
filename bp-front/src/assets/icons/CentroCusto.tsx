import { forwardRef } from 'react'

export const CentroCusto = forwardRef<SVGSVGElement>((props, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="56"
      height="56"
      fill="none"
      viewBox="0 0 56 56"
      {...props}
    >
      <rect width="48" height="48" x="4" y="4" fill="#D9E0ED" rx="24"></rect>
      <rect
        width="48"
        height="48"
        x="4"
        y="4"
        stroke="#D9E0ED"
        strokeOpacity="0.5"
        strokeWidth="8"
        rx="24"
      ></rect>
      <path
        fill="#3B5999"
        fillRule="evenodd"
        d="M13.666 23.238a3.667 3.667 0 013.667-3.666h21.334a3.667 3.667 0 013.666 3.666v2.207a3.667 3.667 0 01-2.613 3.512l-9.9 2.97a6.334 6.334 0 01-3.64 0l-9.9-2.97a3.667 3.667 0 01-2.614-3.512v-2.207zm3.667-1.666c-.92 0-1.666.746-1.666 1.666v2.207c0 .736.482 1.385 1.187 1.596l9.9 2.97a4.334 4.334 0 002.491 0l9.9-2.97a1.667 1.667 0 001.188-1.596v-2.207c0-.92-.746-1.666-1.666-1.666H17.332z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#3B5999"
        fillRule="evenodd"
        d="M28 24.143a1 1 0 011 1v2.286a1 1 0 11-2 0v-2.286a1 1 0 011-1z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#3B5999"
        fillRule="evenodd"
        d="M16.778 27.428v7.238A4.333 4.333 0 0021.11 39H34.89a4.333 4.333 0 004.333-4.334v-7.238h2v7.238A6.333 6.333 0 0134.89 41H21.11a6.333 6.333 0 01-6.333-6.334v-7.238h2zM22.555 18.667A3.667 3.667 0 0126.222 15h3.555a3.667 3.667 0 013.667 3.667v1.904h-2v-1.904c0-.92-.746-1.667-1.667-1.667h-3.555c-.92 0-1.667.746-1.667 1.667v1.904h-2v-1.904z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
})
CentroCusto.displayName = 'CentroCusto'
