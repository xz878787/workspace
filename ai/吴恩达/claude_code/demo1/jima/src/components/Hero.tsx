import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';

const floatingCode = [
  { text: 'const future = await learn()', x: '10%', y: '15%', delay: 0 },
  { text: '<Code />', x: '75%', y: '20%', delay: 0.5 },
  { text: 'git commit -m "成长"', x: '15%', y: '70%', delay: 1 },
  { text: 'while(alive) { keepCoding() }', x: '70%', y: '65%', delay: 1.5 },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center bg-grid overflow-hidden"
    >
      {/* Floating code snippets */}
      {floatingCode.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block text-xs font-mono text-primary/50 bg-surface/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/10"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: item.delay }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block text-sm font-medium text-accent bg-accent/10 rounded-full px-4 py-1.5 mb-6">
            开启你的编程之旅
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <span className="gradient-text">吉玛程序员</span>
          <br />
          <span className="text-text">助你成为</span>
          <span className="gradient-text">顶尖开发者</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          从零基础到就业，系统化课程 + 实战项目驱动 + 一对一导师辅导，
          <br className="hidden md:block" />
          让每一个学员都能获得真正的编程能力。
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <a
            href="#cta"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-medium transition-all duration-200 animate-pulse-glow"
          >
            立即报名
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#courses"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-primary/30 text-text hover:bg-primary/5 transition-colors duration-200"
          >
            <Play className="w-4 h-4" />
            了解课程
          </a>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
    </section>
  );
}
