import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';

const navLinks = [
  { label: '首页', href: '#hero' },
  { label: '课程', href: '#courses' },
  { label: '关于', href: '#about' },
  { label: '联系', href: '#cta' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="gradient-text">吉玛程序员</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-muted hover:text-text transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="text-sm px-5 py-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
          >
            立即报名
          </a>
        </div>

        <button
          className="md:hidden text-text-muted hover:text-text"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-primary/10 px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-text-muted hover:text-text transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={() => setOpen(false)}
            className="text-sm text-center px-5 py-2 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors duration-200"
          >
            立即报名
          </a>
        </div>
      )}
    </nav>
  );
}
