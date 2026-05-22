import { useRef } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'

const screens = [
  {
    title: 'Smart Search',
    description: 'Find restaurants by cuisine, distance, rating, or dietary needs',
    color: 'bg-gradient-to-b from-orange-50 to-orange-100',
    accent: 'bg-orange-500',
    content: (
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-orange-200" />
        <div className="h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center px-3">
          <span className="text-xs text-gray-400">Search "Mexican food near me"...</span>
        </div>
        {['Taco Palace ⭐ 4.8', 'El Burrito Loco ⭐ 4.7', 'Casa Mexicana ⭐ 4.6'].map((r, idx) => (
          <div key={idx} className="h-14 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center px-4 gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs">🌮</div>
            <span className="text-xs font-medium text-gray-900">{r}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Live Tracking',
    description: 'Real-time GPS tracking from the kitchen to your doorstep',
    color: 'bg-gradient-to-b from-blue-50 to-blue-100',
    accent: 'bg-blue-500',
    content: (
      <div className="space-y-3">
        <div className="aspect-video rounded-xl bg-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <div className="text-xs font-medium text-blue-600">Live Map View</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-lg">🛵</div>
          <div>
            <div className="text-xs font-semibold text-gray-900">Your rider is nearby</div>
            <div className="text-[10px] text-gray-400">Arriving in 5 minutes</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Easy Checkout',
    description: 'One-tap payment with Apple Pay, Google Pay, or saved cards',
    color: 'bg-gradient-to-b from-green-50 to-green-100',
    accent: 'bg-green-500',
    content: (
      <div className="space-y-3">
        <div className="h-6 w-16 rounded-full bg-green-200" />
        {[
          { name: 'Classic Burger', qty: '1x', price: '$12.49' },
          { name: 'Truffle Fries', qty: '2x', price: '$13.98' },
          { name: 'Milkshake', qty: '1x', price: '$6.99' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between h-10 px-3 rounded-lg bg-white shadow-sm border border-gray-100">
            <span className="text-xs text-gray-900 truncate">{item.name}</span>
            <span className="text-xs text-gray-400">{item.qty}</span>
            <span className="text-xs font-semibold text-gray-900">{item.price}</span>
          </div>
        ))}
        <div className="h-px bg-gray-200" />
        <div className="flex justify-between">
          <span className="text-sm font-bold text-gray-900">Total</span>
          <span className="text-sm font-bold text-orange-500">$33.46</span>
        </div>
        <div className="h-11 rounded-xl bg-green-500 flex items-center justify-center text-xs font-bold text-white">
          Pay with Apple Pay
        </div>
      </div>
    ),
  },
  {
    title: 'Personalized Feed',
    description: 'Curated picks based on your taste and order history',
    color: 'bg-gradient-to-b from-purple-50 to-purple-100',
    accent: 'bg-purple-500',
    content: (
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-purple-200" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '🍕', label: 'Pizza', tag: 'Based on your likes' },
            { emoji: '🍣', label: 'Sushi', tag: 'Trending near you' },
            { emoji: '🥗', label: 'Healthy', tag: 'You might enjoy' },
            { emoji: '🌮', label: 'Mexican', tag: 'Reorder' },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl bg-white p-3 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs font-semibold text-gray-900">{item.label}</div>
              <div className="text-[10px] text-gray-400">{item.tag}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function AppPreview() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-20 lg:py-28 bg-warm-gray overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          label="APP PREVIEW"
          title="Beautiful. Fast. Delicious."
          subtitle="Swipe through the Foodiez app experience — designed to get your food ordered with as few taps as possible."
        />

        <div
          ref={containerRef}
          className="mt-16 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:justify-center lg:overflow-x-visible"
          style={{ scrollbarWidth: 'none' }}
        >
          {screens.map((screen, i) => (
            <motion.div
              key={screen.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 w-64 snap-center"
            >
              <div className={`rounded-[2.5rem] border-[5px] border-gray-900 shadow-xl shadow-gray-900/10 overflow-hidden ${screen.color}`}>
                <div className="h-6 bg-gray-900 flex items-center justify-center">
                  <div className="h-1.5 w-10 rounded-full bg-gray-700" />
                </div>
                <div className="p-4">
                  <div className={`h-1 w-14 rounded-full ${screen.accent} mb-3`} />
                  {screen.content}
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-gray-900">{screen.title}</div>
                <div className="text-xs text-gray-500 mt-1">{screen.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
