import { forwardRef } from 'react'

export const FilterIcon = forwardRef<SVGSVGElement>((props, ref) => {
  return (
    <svg
      ref={ref}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.25 7C10.25 6.58579 10.5858 6.25 11 6.25L21 6.25C21.4142 6.25 21.75 6.58579 21.75 7C21.75 7.41421 21.4142 7.75 21 7.75L11 7.75C10.5858 7.75 10.25 7.41421 10.25 7Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 5.75C5.69036 5.75 6.25 6.30964 6.25 7C6.25 7.69036 5.69036 8.25 5 8.25C4.30964 8.25 3.75 7.69036 3.75 7C3.75 6.30964 4.30964 5.75 5 5.75ZM7.75 7C7.75 5.48122 6.51878 4.25 5 4.25C3.48122 4.25 2.25 5.48122 2.25 7C2.25 8.51878 3.48122 9.75 5 9.75C6.51878 9.75 7.75 8.51878 7.75 7Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.75 17C13.75 16.5858 13.4142 16.25 13 16.25L3 16.25C2.58579 16.25 2.25 16.5858 2.25 17C2.25 17.4142 2.58579 17.75 3 17.75L13 17.75C13.4142 17.75 13.75 17.4142 13.75 17Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 15.75C18.3096 15.75 17.75 16.3096 17.75 17C17.75 17.6904 18.3096 18.25 19 18.25C19.6904 18.25 20.25 17.6904 20.25 17C20.25 16.3096 19.6904 15.75 19 15.75ZM16.25 17C16.25 15.4812 17.4812 14.25 19 14.25C20.5188 14.25 21.75 15.4812 21.75 17C21.75 18.5188 20.5188 19.75 19 19.75C17.4812 19.75 16.25 18.5188 16.25 17Z"
        fill="white"
      />
    </svg>
  )
})
FilterIcon.displayName = 'FilterIcon'
