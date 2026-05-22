import { motion } from 'framer-motion'
import AppStoreButton from './ui/AppStoreButton'

const trustItems = [
  { value: '4.9', label: 'App Store Rating', icon: '⭐' },
  { value: '25 min', label: 'Avg. Delivery Time', icon: '🛵' },
  { value: '10,000+', label: 'Restaurant Partners', icon: '🍽️' },
]

const floatingCards = [
  { emoji: '🍕', label: 'Pizza', x: '72%', y: '18%', delay: 0 },
  { emoji: '🍔', label: 'Burger', x: '82%', y: '48%', delay: 1.2 },
  { emoji: '🥗', label: 'Salad', x: '68%', y: '72%', delay: 0.6 },
  { emoji: '🍜', label: 'Noodles', x: '88%', y: '28%', delay: 1.8 },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50/50 pt-18">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-600 mb-6">
              🔥 #1 Food Delivery App
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Your favorite
              <br />
              <span className="text-orange-500">food, delivered fast</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg">
              Browse thousands of local restaurants, order in seconds, and get hot,
              fresh meals delivered to your door in under 30 minutes.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <AppStoreButton store="apple" />
              <AppStoreButton store="google" />
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Phone frame */}
            <div className="relative w-72 h-[560px] rounded-[3rem] border-[6px] border-gray-900 bg-white shadow-2xl shadow-gray-900/15 overflow-hidden">
              {/* Status bar */}
              <div className="h-7 bg-gray-900 flex items-center justify-between px-6">
                <span className="text-[10px] font-semibold text-white">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full border border-white/50" />
                  <div className="w-3 h-3 rounded-full border border-white/50" />
                </div>
              </div>
              {/* App UI mockup */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">F</div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Foodiez</div>
                    <div className="text-[10px] text-gray-400">Delivering to ▼ Home</div>
                  </div>
                </div>
                {/* Search bar */}
                <div className="h-10 rounded-xl bg-gray-100 flex items-center px-3 gap-2 mb-4">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs text-gray-400">Search restaurants...</span>
                </div>
                {/* Food cards */}
                <div className="space-y-3">
                  {[
                    { name: 'Margherita Pizza', resto: 'Luigi\'s Italian', price: '$14.99', time: '20-25 min', img: 'bg-red-100' },
                    { name: 'Classic Burger', resto: 'Grill House', price: '$12.49', time: '15-20 min', img: 'bg-yellow-100' },
                    { name: 'Pad Thai Noodles', resto: 'Thai Spice', price: '$15.99', time: '25-30 min', img: 'bg-green-100' },
                  ].map((item, i) => (
                    <div key={item.name} className="flex gap-3 p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100">
                      <div className={`h-16 w-16 rounded-xl ${item.img} flex items-center justify-center text-2xl shrink-0`}>
                        {['🍕', '🍔', '🍜'][i]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.resto}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-orange-500">{item.price}</span>
                          <span className="text-[10px] text-gray-400">• {item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            {floatingCards.map((card) => (
              <motion.div
                key={card.label}
                className="absolute hidden sm:flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xl shadow-gray-900/10 text-sm font-semibold text-gray-900"
                style={{ left: card.x, top: card.y }}
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: card.delay,
                  ease: 'easeInOut',
                }}
              >
                <span className="text-xl">{card.emoji}</span>
                {card.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
