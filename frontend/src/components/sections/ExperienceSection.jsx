import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, Textarea, ImageDrop, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { company: '', role: '', description: '', start_date: '', end_date: '', location: '', technologies: '', responsibilities: '', achievements: '' }

export default function ExperienceSection({ hook }) {
  const { isAdmin } = useAuth()
  const { experience, create, update, remove, uploadLogo } = hook

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState({ ...EMPTY })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [logoFile,     setLogoFile]     = useState(null)
  const [logoPreview,  setLogoPreview]  = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setLogoFile(null); setLogoPreview(''); setErrors({}); setModalOpen(true) }
  const openEdit   = (item) => {
    setEditing(item)
    setForm({
      company: item.company, role: item.role, description: item.description || '',
      start_date: item.start_date, end_date: item.end_date || '', location: item.location || '',
      technologies:     (item.technologies     || []).join(', '),
      responsibilities: (item.responsibilities || []).join('\n'),
      achievements:      item.achievements || '',
    })
    setLogoFile(null); setLogoPreview(item.logo_url || ''); setErrors({}); setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ ...EMPTY }); setLogoFile(null); setLogoPreview(''); setErrors({}) }
  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.company.trim())    e.company    = 'Company name is required.'
    if (!form.role.trim())       e.role       = 'Role is required.'
    if (!form.start_date.trim()) e.start_date = 'Start date is required.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        technologies:     form.technologies.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: form.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
        achievements:     form.achievements.trim(),
      }
      let saved
      if (editing) { saved = await update(editing.id, payload); toast.success('Experience updated') }
      else         { saved = await create(payload);              toast.success('Experience added')   }
      if (logoFile && saved?.id) await uploadLogo(saved.id, logoFile)
      closeModal()
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Experience deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  return (
    <section id="internships" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-80 h-80 bg-brandblue/15 -bottom-20 -right-20 absolute" />
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div><h2 className="text-3xl font-display font-bold section-heading">Internship Experience</h2></div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Internship</button>}
          </div>
        </RevealSection>

        {experience.length === 0
          ? <EmptyState icon="fa-solid fa-briefcase" title="No experience yet" description={isAdmin ? "Click 'Add Internship' to get started." : 'Check back soon.'} />
          : (
            <div className="relative">
              <div className="absolute left-5 sm:left-7 top-2 bottom-2 w-px bg-gradient-primary opacity-40" aria-hidden="true" />
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <RevealSection key={exp.id} direction="from-left" delay={`${idx * 0.15}s`}>
                    <div className="relative pl-16 sm:pl-20">
                      <span className="absolute left-0 top-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl glass-strong grid place-items-center overflow-hidden border border-white/10">
                        {exp.logo_url
                          ? <img src={exp.logo_url} alt={`${exp.company} logo`} className="w-full h-full object-cover" />
                          : <i className="fa-solid fa-building text-brandpurple text-lg" />
                        }
                      </span>
                      <div className="glass portfolio-card glow-hover">
                        <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                          <div>
                            <h3 className="font-display font-semibold text-lg leading-tight">{exp.role}</h3>
                            <p className="text-sm font-medium text-brandpurple">{exp.company}</p>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEdit(exp)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                              <button onClick={() => setDeleteTarget(exp)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                          {exp.start_date && <span className="flex items-center gap-1.5"><i className="fa-solid fa-calendar-days text-brandblue" />{exp.start_date}{exp.end_date ? ` — ${exp.end_date}` : ' — Present'}</span>}
                          {exp.location   && <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-brandblue" />{exp.location}</span>}
                        </div>
                        {exp.technologies?.length > 0 && <div className="flex flex-wrap gap-2 mb-4">{exp.technologies.map(t => <span key={t} className="skill-pill">{t}</span>)}</div>}
                        {exp.responsibilities?.length > 0 && (
                          <ul className="space-y-1.5 mb-3">
                            {exp.responsibilities.map((r, i) => (
                              <li key={i} className="text-sm text-slate-400 flex gap-2">
                                <i className="fa-solid fa-caret-right text-brandpurple mt-1 text-xs shrink-0" /><span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {exp.achievements && (
                          <div className="mt-2 pt-3 border-t border-white/5 flex gap-2 items-start">
                            <i className="fa-solid fa-trophy text-amber-400 mt-0.5 text-sm shrink-0" />
                            <p className="text-sm text-slate-300">{exp.achievements}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Internship' : 'Add Internship'} icon="fa-solid fa-briefcase" wide>
        <form onSubmit={save} className="space-y-4">
          <Field label="Company logo"><ImageDrop value={logoPreview} onChange={(file, preview) => { setLogoFile(file); setLogoPreview(preview) }} label="Upload company logo" shape="rounded-2xl" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company name" error={errors.company}><Input name="company" value={form.company} onChange={change} error={errors.company} placeholder="TechNova Solutions" /></Field>
            <Field label="Role"         error={errors.role}>   <Input name="role"    value={form.role}    onChange={change} error={errors.role}    placeholder="Software Engineering Intern" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Start date" error={errors.start_date}><Input name="start_date" value={form.start_date} onChange={change} error={errors.start_date} placeholder="Jun 2025" /></Field>
            <Field label="End date"><Input name="end_date" value={form.end_date} onChange={change} placeholder="Aug 2025 or Present" /></Field>
          </div>
          <Field label="Location"><Input name="location" value={form.location} onChange={change} placeholder="Bengaluru, India (Hybrid)" /></Field>
          <Field label="Technologies used" hint="Comma-separated"><Input name="technologies" value={form.technologies} onChange={change} /></Field>
          <Field label="Key responsibilities" hint="One per line"><Textarea name="responsibilities" rows={4} value={form.responsibilities} onChange={change} /></Field>
          <Field label="Achievements"><Textarea name="achievements" rows={2} value={form.achievements} onChange={change} /></Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="Delete this internship?" description={deleteTarget ? `Remove "${deleteTarget.role} at ${deleteTarget.company}"?` : ''} />
    </section>
  )
}
