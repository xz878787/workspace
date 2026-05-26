import { Code2 } from 'lucide-react';

const footerLinks = [
  {
    title: '课程',
    links: ['Web 前端', 'Java 后端', '全栈训练营', '算法冲刺班'],
  },
  {
    title: '关于',
    links: ['团队介绍', '学员故事', '合作企业', '常见问题'],
  },
  {
    title: '联系',
    links: ['微信咨询', '邮件联系', 'GitHub', '公众号'],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#hero" className="flex items-center gap-2 text-lg font-bold mb-4">
              <Code2 className="w-6 h-6 text-primary" />
              <span className="gradient-text">吉玛程序员</span>
            </a>
            <p className="text-sm text-text-muted leading-relaxed">
              让每个人都能学会真正的编程技能
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-text mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-sm text-text-muted hover:text-text transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} 吉玛程序员. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="#" className="hover:text-text transition-colors">隐私政策</a>
            <a href="#" className="hover:text-text transition-colors">服务条款</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
