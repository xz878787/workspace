import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Mail } from 'lucide-react';

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="cta" className="py-24 px-6">
      <motion.div
        ref={ref}
        className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface-light to-accent/10 border border-primary/20 p-12 md:p-16 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <h2 className="relative text-3xl md:text-4xl font-bold text-text mb-4">
          准备好<span className="gradient-text">改变自己</span>了吗？
        </h2>
        <p className="relative text-text-muted max-w-lg mx-auto mb-8 leading-relaxed">
          加入吉玛程序员，与数千名学员一起开启编程之旅。
          现在就行动，未来的你会感谢今天的决定。
        </p>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:contact@jima.dev"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-medium transition-all duration-200 animate-pulse-glow"
          >
            <Mail className="w-4 h-4" />
            立即咨询
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <span className="text-sm text-text-muted">或直接添加微信咨询</span>
        </div>
      </motion.div>
    </section>
  );
}
