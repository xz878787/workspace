import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Heart, Lightbulb } from 'lucide-react';

const values = [
  { icon: Lightbulb, text: '授人以渔，培养独立解决问题的能力' },
  { icon: Code2, text: '代码质量优先，从一开始就养成好习惯' },
  { icon: Heart, text: '用心对待每一位学员，成长路上不孤单' },
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium text-accent bg-accent/10 rounded-full px-4 py-1.5">
              关于我们
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text mt-6 mb-6">
              吉玛程序员<span className="gradient-text">的使命</span>
            </h2>
            <p className="text-text-muted leading-relaxed mb-6">
              我们是一群热爱编程、热爱分享的工程师。在行业一线打拼多年后，我们发现许多编程培训只是照本宣科，学员学完后仍然无法独立完成工作。
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              吉玛程序员由此诞生——我们坚持<b className="text-text">小班教学 + 实战驱动</b>，
              让每一位学员都能获得真实的编程能力，而不仅仅是一张证书。
            </p>

            <div className="space-y-4">
              {values.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <v.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-text-muted">{v.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: decorative code block */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="rounded-2xl bg-surface-light border border-primary/10 overflow-hidden shadow-lg">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-lighter border-b border-primary/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-text-muted ml-2">jima.tsx</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-blue-400">jima</span>{' '}
                  <span className="text-text-muted">=</span>{' '}
                  <span className="text-yellow-400">{'{'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">mission</span>
                  <span className="text-text-muted">:</span>{' '}
                  <span className="text-green-400">"让每个学员都能真正学会编程"</span>
                  <span className="text-text-muted">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">method</span>
                  <span className="text-text-muted">:</span>{' '}
                  <span className="text-green-400">"实战项目驱动 + 导师一对一"</span>
                  <span className="text-text-muted">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">students</span>
                  <span className="text-text-muted">:</span>{' '}
                  <span className="text-orange-400">5000</span>
                  <span className="text-text-muted">+</span>
                  <span className="text-text-muted">,</span>
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">satisfaction</span>
                  <span className="text-text-muted">:</span>{' '}
                  <span className="text-orange-400">98</span>
                  <span className="text-text-muted">%</span>
                  <span className="text-text-muted">,</span>
                </div>
                <div>
                  <span className="text-yellow-400">{'}'}</span>
                  <span className="text-text-muted">;</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
