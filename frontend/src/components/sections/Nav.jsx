import React, { useState, useEffect } from 'react'

const LINKS = [
  { href: '#profile',      label: 'Profile',      icon: 'fa-solid fa-user'           },
  { href: '#resume',       label: 'Resume',       icon: 'fa-solid fa-file'           },
  { href: '#skills',       label: 'Skills',       icon: 'fa-solid fa-code'           },
  { href: '#internships',  label: 'Internships',  icon: 'fa-solid fa-briefcase'      },
  { href: '#projects',     label: 'Projects',     icon: 'fa-solid fa-folder'         },
  { href: '#certificates', label: 'Certificates', icon: 'fa-solid fa-award'          },
  { href: '#education',    label: 'Education',    icon: 'fa-solid fa-graduation-cap' },
  { href: '#contact',      label: 'Contact',      icon: 'fa-solid fa-envelope'       },
]

export default function Nav() {
  const [active,   setActive]   = useState('#profile')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive('#' + e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-[100] py-4 transition-all duration-300">
      <nav className="max-w-5xl mx-auto px-5">
        <div className={`rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'glass-strong shadow-2xl shadow-black/30' : 'glass'}`}>
          <span className="font-display font-bold gradient-text">Portfolio</span>

          {/* Desktop */}
          <ul className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${active === l.href ? 'bg-brandpurple/15 text-brandpurple' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  <i className={`${l.icon} text-xs`} />{l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button className="lg:hidden icon-btn hover:bg-white/10" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="glass-strong rounded-2xl mt-2 p-3 flex flex-col gap-1 lg:hidden">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active === l.href ? 'bg-brandpurple/15 text-brandpurple' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                <i className={`${l.icon} w-4 text-center`} />{l.label}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
