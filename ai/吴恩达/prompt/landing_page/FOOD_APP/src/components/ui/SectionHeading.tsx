import { motion } from 'framer-motion'

interface SectionHeadingProps {
  label?: string
  title: string
  subtitle?: string
  centered?: boolean
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  centered = false,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={`${centered ? 'text-center' : ''}`}
    >
      {label && (
        <span className="inline-block text-sm font-semibold tracking-wider uppercase text-orange-500 mb-3">
          {label}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
