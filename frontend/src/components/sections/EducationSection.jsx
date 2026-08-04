import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, Textarea, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { college: '', degree: '', specialization: '', start_year: '', end_year: '', cgpa: '', description: '' }

export default function EducationSection({ hook }) {
  const { isAdmin } = useAuth()
  const { education, create, update, remove } = hook

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState({ ...EMPTY })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setModalOpen(true) }
  const openEdit   = (e) => { setEditing(e); setForm({ college: e.college, degree: e.degree, specialization: e.specialization || '', start_year: e.start_year, end_year: e.end_year || '', cgpa: e.cgpa || '', description: e.description || '' }); setErrors({}); setModalOpen(true) }
  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.college.trim())    e.college    = 'Institution is required.'
    if (!form.degree.trim())     e.degree     = 'Degree is required.'
    if (!form.start_year.trim()) e.start_year = 'Start year is required.'
    else if (!/^\d{4}$/.test(form.start_year)) e.start_year = 'Enter a 4-digit year.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      if (editing) { await update(editing.id, form); toast.success('Education updated') }
      else         { await create(form);              toast.success('Education added')   }
      setModalOpen(false)
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Education deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  return (
    <section id="education" className="portfolio-section py-20 scroll-mt-20">
      <div className="section-inner" style={{ maxWidth: '56rem' }}>
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div><h2 className="text-3xl font-display font-bold section-heading">Education</h2></div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Education</button>}
          </div>
        </RevealSection>

        {education.length === 0
          ? <EmptyState icon="fa-solid fa-book-open" title="No education yet" description={isAdmin ? "Click 'Add Education' to get started." : 'Check back soon.'} />
          : (
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-primary opacity-40" aria-hidden="true" />
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <RevealSection key={edu.id} direction="from-left" delay={`${idx * 0.15}s`}>
                    <div className="relative pl-14">
                      <span className="absolute left-0 top-1 w-10 h-10 rounded-full glass-strong grid place-items-center">
                        <i className="fa-solid fa-graduation-cap text-brandpurple" />
                      </span>
                      <div className="glass portfolio-card glow-hover">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-display font-semibold text-lg">{edu.degree}{edu.specialization ? ` — ${edu.specialization}` : ''}</h3>
                          {isAdmin && (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openEdit(edu)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                              <button onClick={() => setDeleteTarget(edu)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-brandpurple mb-1">{edu.college}</p>
                        <p className="text-xs text-slate-500 mb-3">{edu.start_year} — {edu.end_year || 'Present'}{edu.cgpa ? ` · ${edu.cgpa}` : ''}</p>
                        {edu.description && <p className="text-sm text-slate-400">{edu.description}</p>}
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Education' : 'Add Education'} icon="fa-solid fa-graduation-cap">
        <form onSubmit={save} className="space-y-4">
          <Field label="Institution name" error={errors.college}><Input name="college" value={form.college} onChange={change} error={errors.college} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Degree"         error={errors.degree}><Input name="degree"         value={form.degree}         onChange={change} error={errors.degree} placeholder="B.Tech" /></Field>
            <Field label="Specialization">                      <Input name="specialization" value={form.specialization} onChange={change}                       placeholder="AI & Data Science" /></Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Start year" error={errors.start_year}><Input name="start_year" value={form.start_year} onChange={change} error={errors.start_year} placeholder="2022" /></Field>
            <Field label="End year"><Input name="end_year" value={form.end_year} onChange={change} placeholder="2026 or Present" /></Field>
            <Field label="CGPA / %"><Input name="cgpa" value={form.cgpa} onChange={change} placeholder="8.6 CGPA" /></Field>
          </div>
          <Field label="Description"><Textarea name="description" rows={3} value={form.description} onChange={change} /></Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete this education entry?" />
    </section>
  )
}
