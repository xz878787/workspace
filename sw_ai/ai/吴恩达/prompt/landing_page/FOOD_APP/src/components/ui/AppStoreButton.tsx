import { motion } from 'framer-motion'

interface AppStoreButtonProps {
  store: 'apple' | 'google'
  className?: string
}

export default function AppStoreButton({ store, className = '' }: AppStoreButtonProps) {
  const isApple = store === 'apple'

  return (
    <motion.a
      href="#"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`
        inline-flex items-center gap-3 rounded-2xl px-6 py-3
        bg-gray-900 text-white cursor-pointer
        transition-shadow duration-200
        hover:shadow-xl hover:shadow-gray-900/30
        focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/40
        ${className}
      `}
      aria-label={isApple ? 'Download on the App Store' : 'Get it on Google Play'}
    >
      <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {isApple ? (
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
        ) : (
          <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 01-.11-.55V2.364a1.5 1.5 0 01.11-.55zM16.25 9.54l-2.458 2.46 2.458 2.46 2.93-1.69a1.77 1.77 0 000-3.08l-2.93-1.69zM1.5 2.364v19.272a1.5 1.5 0 00.1.55L13.792 12 1.599 1.814a1.5 1.5 0 00-.1.55z" />
        )}
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium opacity-80">
          {isApple ? 'Download on the' : 'GET IT ON'}
        </div>
        <div className="text-base font-semibold -mt-0.5">
          {isApple ? 'App Store' : 'Google Play'}
        </div>
      </div>
    </motion.a>
  )
}
