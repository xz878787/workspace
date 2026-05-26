import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Users, Target, Zap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: '系统化课程体系',
    desc: '从前端到后端，从基础到架构，循序渐进的知识路线图，覆盖业界主流技术栈。',
  },
  {
    icon: Users,
    title: '一对一导师辅导',
    desc: '资深工程师全程陪伴式指导，代码审查、答疑解惑，确保每个学员都不掉队。',
  },
  {
    icon: Target,
    title: '实战项目驱动',
    desc: '拒绝纸上谈兵，每个阶段都有真实商业项目练手，积累可写入简历的项目经验。',
  },
  {
    icon: Zap,
    title: '就业内推服务',
    desc: '与百余家企业建立合作关系，优秀学员直推面试，助你快速拿到心仪 offer。',
  },
];

function FeatureCard({
  icon: Icon,
  title,
  desc,
  index,
}: (typeof features)[0] & { index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className="relative group p-8 rounded-2xl bg-surface-light border border-primary/10 hover:glow-border transition-all duration-300"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-3">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-medium text-accent bg-accent/10 rounded-full px-4 py-1.5">
            为什么选择我们
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text mt-6 mb-4">
            不只是教学，更是<span className="gradient-text">职业加速器</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            我们致力于提供远超行业标准的编程培训体验
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
