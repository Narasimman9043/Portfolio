import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, Textarea, ImageDrop, SocialLink } from '../ui'

export default function ProfileSection({ hook }) {
  const { isAdmin } = useAuth()
  const { profile, update, uploadPhoto } = hook

  const [open,         setOpen]         = useState(false)
  const [form,         setForm]         = useState({})
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    if (open && profile) {
      setForm({ ...profile })
      setErrors({})
      setPhotoFile(null)
      setPhotoPreview(profile.profile_image || '')
    }
  }, [open, profile])

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.full_name?.trim())   e.full_name   = 'Full name is required.'
    if (!form.designation?.trim()) e.designation = 'Title is required.'
    if (!form.email?.trim())       e.email       = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      if (photoFile) {
        await uploadPhoto(photoFile)
        toast.success('Photo uploaded')
      }
      const { id, profile_image, created_at, updated_at, ...fields } = form
      await update(fields)
      toast.success('Profile updated')
      setOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return null
  const p = profile

  return (
    <section id="profile" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-96 h-96 bg-brandblue/20 -top-32 -left-32 absolute" />
      <div className="orb w-72 h-72 bg-brandpurple/20 top-10 right-0 absolute" style={{ animationDelay: '2s' }} />
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="glass rounded-3xl p-8 sm:p-10 relative glow-hover">
            {isAdmin && (
              <button onClick={() => setOpen(true)} className="absolute top-6 right-6 btn-outline !py-2 !px-4 text-sm">
                <i className="fa-solid fa-pen" /> Edit Profile
              </button>
            )}
            <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-center">
              <RevealSection direction="from-zoom">
                <div className="relative mx-auto sm:mx-0 w-32 h-32">
                  <div className="absolute -inset-2 rounded-full bg-gradient-primary opacity-30 blur-xl" />
                  <div className="relative w-32 h-32 rounded-full overflow-hidden glass-strong grid place-items-center">
                    {p.profile_image
                      ? <img src={p.profile_image} alt={p.full_name} className="w-full h-full object-cover" />
                      : <span className="font-display text-3xl gradient-text">{p.full_name?.split(' ').map(n => n[0]).join('')}</span>
                    }
                  </div>
                </div>
              </RevealSection>
              <RevealSection direction="from-right" delay="0.15s">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-1">{p.full_name}</h1>
                  <p className="text-brandpurple font-medium mb-3">{p.designation}</p>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">{p.about}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
                      <i className="fa-solid fa-envelope text-brandblue" />{p.email}
                    </span>
                    {p.phone && (
                      <span className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
                        <i className="fa-solid fa-phone text-brandblue" />{p.phone}
                      </span>
                    )}
                    {p.location && (
                      <span className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-brandblue" />{p.location}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <SocialLink url={p.linkedin_url} icon="fa-brands fa-linkedin" label="LinkedIn" color="text-brandblue" />
                    <SocialLink url={p.github_url}   icon="fa-brands fa-github"   label="GitHub"   color="text-slate-200" />
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </RevealSection>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit Profile" icon="fa-solid fa-pen">
        <form onSubmit={save} className="space-y-4">
          <Field label="Profile photo">
            <ImageDrop value={photoPreview} onChange={(file, preview) => { setPhotoFile(file); setPhotoPreview(preview) }} label="Upload profile photo" shape="rounded-full" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name"  error={errors.full_name}>  <Input name="full_name"   value={form.full_name   || ''} onChange={change} error={errors.full_name}   /></Field>
            <Field label="Job title"  error={errors.designation}><Input name="designation" value={form.designation || ''} onChange={change} error={errors.designation} /></Field>
          </div>
          <Field label="About me"><Textarea name="about" rows={4} value={form.about || ''} onChange={change} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"  error={errors.email}><Input type="email" name="email" value={form.email || ''} onChange={change} error={errors.email} /></Field>
            <Field label="Phone"><Input name="phone" value={form.phone || ''} onChange={change} /></Field>
          </div>
          <Field label="Location"><Input name="location" value={form.location || ''} onChange={change} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="LinkedIn"><Input name="linkedin_url" value={form.linkedin_url || ''} onChange={change} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="GitHub">  <Input name="github_url"   value={form.github_url   || ''} onChange={change} placeholder="https://github.com/..."    /></Field>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
