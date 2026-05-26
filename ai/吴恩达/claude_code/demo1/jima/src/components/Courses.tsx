import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, BarChart3 } from 'lucide-react';

const courses = [
  {
    title: 'Web 前端入门到实战',
    desc: 'HTML/CSS/JavaScript 基础 → React/Vue 框架 → 项目上线，手把手带你入门前端开发。',
    duration: '12 周',
    level: '零基础入门',
    tags: ['HTML/CSS', 'JavaScript', 'React', 'Vue'],
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    title: 'Java 后端开发工程师',
    desc: 'Java 核心 → Spring Boot → 微服务架构，从 CRUD 到高并发系统设计的全面进阶。',
    duration: '16 周',
    level: '进阶提升',
    tags: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
  {
    title: '全栈项目实战训练营',
    desc: '前后端联动开发真实商业项目，系统设计 + 编码实践 + 部署运维，一站式全栈体验。',
    duration: '8 周',
    level: '中级以上',
    tags: ['React', 'Node.js', 'Docker', 'AWS'],
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
  {
    title: '算法与面试冲刺班',
    desc: 'LeetCode 高频题型精讲 + 大厂面试模拟 + 系统设计面试，短期冲刺拿到 offer。',
    duration: '6 周',
    level: '面试备战',
    tags: ['数据结构', '算法', '系统设计', '模拟面试'],
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
  },
];

function CourseCard({
  course,
  index,
}: {
  course: (typeof courses)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`relative group rounded-2xl bg-surface-light border ${course.borderColor} overflow-hidden hover:-translate-y-1 transition-all duration-300`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={`h-2 bg-gradient-to-r ${course.color}`} />
      <div className="p-7">
        <h3 className="text-lg font-semibold text-text mb-3">{course.title}</h3>
        <p className="text-sm text-text-muted leading-relaxed mb-5">{course.desc}</p>

        <div className="flex items-center gap-4 text-xs text-text-muted mb-5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            {course.level}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-1 rounded-full bg-surface-lighter text-text-muted border border-primary/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Courses() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="courses" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-medium text-accent bg-accent/10 rounded-full px-4 py-1.5">
            精选课程
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text mt-6 mb-4">
            找到适合你的<span className="gradient-text">学习路径</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            从入门到精通，每个阶段都有精心设计的课程等你来学
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course, i) => (
            <CourseCard key={i} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
