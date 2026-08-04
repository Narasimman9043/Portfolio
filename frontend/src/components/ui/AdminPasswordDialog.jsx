import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

/**
 * Admin password dialog.
 *
 * Security model:
 *  • Password is verified client-side via SHA-256 (Web Crypto API).
 *  • The plain-text password is NEVER stored — only a SHA-256 hash lives in AuthContext.
 *  • On success, a backend JWT is obtained silently for API write access.
 *  • Inactivity auto-logout fires after 15 min (configured in AuthContext).
 *
 * Default password: Narasimman@2005
 * To change: generate a new hash in the browser console with hashPassword('NewPass'),
 * then update ADMIN_HASH in src/context/AuthContext.jsx.
 */
export default function AdminPasswordDialog({ open, onClose }) {
  const { isAdmin, authLoading, handleLogin, handleLogout } = useAuth()
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
      setShow(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (isAdmin) {
      await handleLogout()
      onClose()
      return
    }
    if (!password) { setError('Please enter the password.'); return }
    setError('')
    const ok = await handleLogin(password)
    if (ok) {
      onClose()
    } else {
      setError('Incorrect password. Access denied.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center p-4 bg-black/70 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label="Admin authentication"
    >
      <div className="glass-strong rounded-2xl w-full max-w-sm p-7 shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
            <i className="fa-solid fa-shield-halved text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">
              {isAdmin ? 'Disable Admin Mode' : 'Admin Authentication'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAdmin
                ? 'Click Confirm to lock editing.'
                : 'Enter password to unlock editing.'}
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Password field — login only */}
          {!isAdmin && (
            <>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-11 outline-none focus:border-brandpurple transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </p>
              )}
            </>
          )}

          {/* Logout confirmation */}
          {isAdmin && (
            <p className="text-sm text-slate-400 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              Click <strong className="text-white">Confirm</strong> to disable admin mode
              and lock all editing controls.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary flex-1 justify-center disabled:opacity-60"
            >
              {authLoading
                ? <><i className="fa-solid fa-spinner animate-spin" /> Verifying…</>
                : isAdmin
                  ? <><i className="fa-solid fa-lock" /> Confirm</>
                  : <><i className="fa-solid fa-key" /> Confirm</>
              }
            </button>
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
