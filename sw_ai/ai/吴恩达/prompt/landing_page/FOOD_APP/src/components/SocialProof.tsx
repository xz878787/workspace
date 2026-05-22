import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'

const partnerLogos = [
  { name: 'McDonald\'s' },
  { name: 'Pizza Hut' },
  { name: 'Subway' },
  { name: 'Chipotle' },
  { name: 'Starbucks' },
  { name: 'KFC' },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Regular Customer',
    avatar: 'SJ',
    quote: 'Foodiez has completely changed how I order food. The real-time tracking means I know exactly when my meal arrives. It\'s incredibly fast and the UI is beautiful.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Food Enthusiast',
    avatar: 'MC',
    quote: 'I love discovering new local restaurants through the personalized recommendations. The checkout process is the smoothest I\'ve ever used in any food app.',
    rating: 5,
  },
  {
    name: 'Emma Rodriguez',
    role: 'Busy Professional',
    avatar: 'ER',
    quote: 'As someone who orders lunch daily, Foodiez saves me so much time. The exclusive deals and lightning-fast delivery keep me coming back every single day.',
    rating: 5,
  },
]

export default function SocialProof() {
  return (
    <section id="reviews" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Partner logos */}
        <div className="text-center mb-16">
          <SectionHeading
            centered
            label="TRUSTED BY TOP RESTAURANTS"
            title="Partnering with the best"
            subtitle="We work with thousands of restaurants — from your neighborhood favorites to the nation's most beloved chains."
          />
          <div className="mt-12 grid grid-cols-3 sm:grid-cols-6 gap-6 items-center justify-items-center opacity-50">
            {partnerLogos.map((logo) => (
              <div key={logo.name} className="text-lg font-bold text-gray-400 tracking-tight">
                {logo.name}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <SectionHeading
            centered
            label="WHAT OUR USERS SAY"
            title="Loved by foodies everywhere"
          />
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="rounded-3xl bg-orange-50 p-8 flex flex-col"
              >
                <div className="flex items-center gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-orange-200">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
