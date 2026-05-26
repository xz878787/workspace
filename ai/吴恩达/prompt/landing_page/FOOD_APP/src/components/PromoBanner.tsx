import { motion } from 'framer-motion'
import Button from './ui/Button'

export default function PromoBanner() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600" />
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-400/30 blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-orange-300/25 blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20"
        >
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white mb-4">
              🎉 Limited Time Offer
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Free delivery on your first order
            </h2>
            <p className="mt-4 text-lg text-orange-50 leading-relaxed max-w-lg">
              New to Foodiez? We'll waive the delivery fee on your very first order.
              No catch — just great food delivered to your door for free.
            </p>
            <div className="mt-8">
              <Button variant="secondary" size="lg">
                Claim Your Free Delivery
              </Button>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0"
          >
            <div className="flex h-36 w-36 lg:h-44 lg:w-44 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <span className="text-6xl lg:text-7xl" role="img" aria-hidden="true">🛵</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
