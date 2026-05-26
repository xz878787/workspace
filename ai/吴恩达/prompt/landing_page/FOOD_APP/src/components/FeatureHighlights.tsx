import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'

const features = [
  {
    title: 'Real-time order tracking',
    description:
      'Watch your order move from the restaurant kitchen to your front door. Get live map updates, estimated arrival times, and push notifications at every step — no more wondering where your food is.',
    image: '📍',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Personalized recommendations',
    description:
      'Our smart algorithm learns your taste preferences and suggests dishes you\'ll love. Discover hidden gems, reorder favorites instantly, and explore cuisines tailored just for you.',
    image: '🎯',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Lightning-fast checkout',
    description:
      'Reorder in one tap, save multiple payment methods, and breeze through checkout with Apple Pay or Google Pay. The fastest checkout experience in food delivery — period.',
    image: '⚡',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Exclusive local restaurants',
    description:
      'Access restaurants you won\'t find on any other platform. We partner directly with local eateries to bring you unique dishes, exclusive menu items, and special pricing only available on Foodiez.',
    image: '🍽️',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

export default function FeatureHighlights() {
  return (
    <section id="restaurants" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          label="WHY FOODIEZ"
          title="Everything you need for the perfect meal"
          subtitle="From discovery to delivery, every feature is designed to make your food experience effortless and delightful."
        />

        <div className="mt-16 space-y-20 lg:space-y-28">
          {features.map((feature, i) => {
            const isEven = i % 2 === 0
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 56 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col gap-10 lg:gap-16 items-center ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Image side */}
                <div className="flex-1 w-full max-w-lg lg:max-w-none">
                  <div className={`relative aspect-square max-w-md mx-auto rounded-[3rem] bg-gradient-to-br ${feature.gradient} p-8 flex items-center justify-center shadow-2xl shadow-gray-900/10`}>
                    <span className="text-8xl" role="img" aria-hidden="true">{feature.image}</span>
                    {/* Decorative elements */}
                    <div className="absolute top-8 left-8 h-3 w-3 rounded-full bg-white/30" />
                    <div className="absolute top-8 right-8 h-2 w-16 rounded-full bg-white/20" />
                    <div className="absolute bottom-12 left-12 right-12 h-2 rounded-full bg-white/15" />
                    <div className="absolute bottom-8 left-16 right-16 h-2 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Text side */}
                <div className="flex-1">
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {['Best-in-class performance', 'Available on iOS and Android', '24/7 customer support'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="h-5 w-5 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
