import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/profileService'
import { RevealSection, Modal, Field, Input, SocialLink } from '../ui'

export default function Footer({ profile, onRefresh, onAdminToggle, onMessagesOpen }) {
  const { isAdmin } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [form,      setForm]      = useState({ linkedin_url: '', github_url: '' })
  const [saving,    setSaving]    = useState(false)

  const openEdit = () => {
    if (!isAdmin) { onAdminToggle(); return }
    setForm({ linkedin_url: profile?.linkedin_url || '', github_url: profile?.github_url || '' })
    setModalOpen(true)
  }

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const save = async (ev) => {
    ev.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    try {
      await updateProfile(profile.id, form)
      await onRefresh()
      toast.success('Social links updated')
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <footer className="relative mt-10 border-t border-white/5 bg-[#05060d]">
      <div className="orb w-72 h-72 bg-brandblue/10 -bottom-20 left-1/2 -translate-x-1/2 absolute" aria-hidden="true" />
      <RevealSection direction="from-bottom">
        <div className="section-inner py-14 relative">
          <div className="flex flex-col items-center gap-8 text-center">
            <span className="font-display font-bold gradient-text text-lg">{profile?.full_name || 'Portfolio'}</span>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              <SocialLink url={profile?.linkedin_url} icon="fa-brands fa-linkedin" label="LinkedIn" variant="footer" />
              <SocialLink url={profile?.github_url}   icon="fa-brands fa-github"   label="GitHub"   variant="footer" />
              {isAdmin && (
                <>
                  <button onClick={openEdit} aria-label="Edit social links" className="icon-btn glass hover:bg-white/10">
                    <i className="fa-solid fa-pen text-xs" />
                  </button>
                  <button onClick={onMessagesOpen} aria-label="View messages" className="icon-btn glass hover:bg-white/10 relative">
                    <i className="fa-solid fa-envelope text-xs" />
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} {profile?.full_name}. All rights reserved.</p>
          </div>
        </div>
      </RevealSection>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Social Links" icon="fa-solid fa-share-nodes">
        <form onSubmit={save} className="space-y-4">
          <Field label="LinkedIn URL"><Input name="linkedin_url" value={form.linkedin_url} onChange={change} placeholder="https://linkedin.com/in/..." /></Field>
          <Field label="GitHub URL">  <Input name="github_url"   value={form.github_url}   onChange={change} placeholder="https://github.com/..."    /></Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </footer>
  )
}
