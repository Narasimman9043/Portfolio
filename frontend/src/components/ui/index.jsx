import React, { useEffect, useRef, useState } from 'react'

/* ── Scroll reveal ── */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const headings = document.querySelectorAll('.section-heading')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach((el) => io.observe(el))
    headings.forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
}

export function RevealSection({ children, className = '', direction = 'from-bottom', delay = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); io.disconnect() } }, { threshold: 0.1 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${direction} ${className}`} style={delay ? { transitionDelay: delay } : {}}>{children}</div>
}

/* ── Modal ── */
export function Modal({ open, onClose, title, icon, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center p-4 bg-black/60 animate-fade-up" role="dialog" aria-modal="true">
      <div className={`glass-strong rounded-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            {icon && <i className={`${icon} text-brandpurple`} />} {title}
          </h2>
          <button onClick={onClose} className="icon-btn hover:bg-white/10" aria-label="Close"><i className="fa-solid fa-xmark" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Confirm dialog ── */
export function ConfirmDialog({ open, onCancel, onConfirm, title, description }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[160] grid place-items-center p-4 bg-black/70">
      <div className="glass-strong rounded-2xl w-full max-w-sm p-6 text-center animate-fade-up">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/15 grid place-items-center mb-4">
          <i className="fa-solid fa-triangle-exclamation text-rose-400 text-xl" />
        </div>
        <h2 className="font-display font-semibold text-lg mb-2">{title || 'Delete this item?'}</h2>
        <p className="text-sm text-slate-400 mb-6">{description || 'This action cannot be undone.'}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="btn-outline !py-2 !px-5 text-sm">Cancel</button>
          <button onClick={onConfirm} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-rose-400 border border-rose-500/40 hover:bg-rose-500/10 transition-colors">
            <i className="fa-solid fa-trash" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Field / Input / Textarea ── */
export function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-200">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation" />{error}</p>}
    </div>
  )
}

const inputCls = (error) =>
  `w-full rounded-xl bg-white/5 border ${error ? 'border-rose-500/60' : 'border-white/10'} px-4 py-2.5 outline-none focus:border-brandpurple transition-colors text-sm`

export function Input({ error, className = '', ...rest }) {
  return <input {...rest} className={`${inputCls(error)} ${className}`} />
}
export function Textarea({ error, className = '', ...rest }) {
  return <textarea {...rest} className={`${inputCls(error)} resize-none ${className}`} />
}

/* ── ImageDrop — returns File + preview URL to parent ── */
export function ImageDrop({ value, onChange, label = 'Upload image', shape = 'rounded-2xl', accept = 'image/*' }) {
  const ref = useRef(null)
  const [drag, setDrag] = useState(false)
  const handle = (file) => {
    if (!file) return
    onChange(file, URL.createObjectURL(file))
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]) }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer border-2 border-dashed ${drag ? 'border-brandpurple bg-brandpurple/10' : 'border-white/15'} ${shape} p-4 flex items-center gap-4 transition-colors`}
    >
      {value
        ? <img src={value} alt="Preview" className={`w-16 h-16 object-cover ${shape}`} />
        : <div className={`w-16 h-16 grid place-items-center bg-white/5 ${shape} shrink-0`}><i className="fa-solid fa-image text-slate-500" /></div>
      }
      <div className="text-sm text-slate-400">
        <p className="font-medium text-slate-200">{label}</p>
        <p className="text-xs">Click or drag an image here</p>
      </div>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-14 glass rounded-2xl">
      <i className={`${icon} text-3xl text-slate-500 mb-3`} />
      <p className="font-display font-semibold mb-1">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}

/* ── Loading screen ── */
export function LoadingScreen({ show }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[300] bg-[#0B0E1A] grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brandblue border-r-brandpurple animate-spin-slow" />
          <span className="absolute inset-3 rounded-full bg-gradient-primary" />
        </div>
        <p className="text-sm text-slate-400 font-display">Loading portfolio…</p>
      </div>
    </div>
  )
}

/* ── Skeleton card ── */
export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <div className="skeleton h-4 rounded-full w-3/4" />
      <div className="skeleton h-3 rounded-full w-1/2" />
      <div className="skeleton h-3 rounded-full w-full" />
      <div className="skeleton h-3 rounded-full w-5/6" />
    </div>
  )
}

/* ── Social link ── */
export function SocialLink({ url, icon, label, color = 'text-brandblue', variant = 'default' }) {
  const safeUrl = React.useMemo(() => {
    if (!url?.trim()) return null
    return /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
  }, [url])
  const isFooter = variant === 'footer'
  const btnClass = isFooter ? 'footer-social-btn' : 'social-btn glass'
  const iconClass = isFooter ? icon : `${icon} ${color} text-base`
  if (!safeUrl) {
    return (
      <span className={btnClass} aria-disabled="true" role="img" aria-label={`${label} — not available`}>
        <i className={iconClass} />
        {!isFooter && <span className="s-tip">{label} not set</span>}
      </span>
    )
  }
  return (
    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={btnClass} aria-label={`Open ${label}`}>
      <i className={iconClass} />
      {!isFooter && <span className="s-tip">Open {label}</span>}
    </a>
  )
}
