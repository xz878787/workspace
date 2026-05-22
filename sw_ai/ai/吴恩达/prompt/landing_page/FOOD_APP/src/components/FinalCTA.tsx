import { motion } from 'framer-motion'
import AppStoreButton from './ui/AppStoreButton'

export default function FinalCTA() {
  return (
    <section id="download" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900" />
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-orange-400 mb-6">
            READY TO GET STARTED?
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Download Foodiez and get your food faster than ever
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Join millions of happy food lovers. Available on iOS and Android —
            download now and enjoy free delivery on your first order.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <AppStoreButton store="apple" />
            <AppStoreButton store="google" />
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 text-sm text-gray-500">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            4.9/5 rating on both App Store and Google Play
          </div>
        </motion.div>
      </div>
    </section>
  )
}
