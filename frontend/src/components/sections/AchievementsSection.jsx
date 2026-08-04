import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, Textarea, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { title: '', description: '' }

export default function AchievementsSection({ hook }) {
  const { isAdmin } = useAuth()
  const { achievements, create, update, remove } = hook

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState({ ...EMPTY })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setModalOpen(true) }
  const openEdit   = (a) => { setEditing(a); setForm({ title: a.title, description: a.description || '' }); setErrors({}); setModalOpen(true) }
  const change     = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      if (editing) { await update(editing.id, form); toast.success('Achievement updated') }
      else         { await create(form);              toast.success('Achievement added')   }
      setModalOpen(false)
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Achievement deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  if (!isAdmin && achievements.length === 0) return null

  return (
    <section id="achievements" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-72 h-72 bg-amber-500/10 top-0 left-0 absolute" />
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div><h2 className="text-3xl font-display font-bold section-heading">Achievements</h2></div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Achievement</button>}
          </div>
        </RevealSection>

        {achievements.length === 0
          ? <EmptyState icon="fa-solid fa-trophy" title="No achievements yet" description="Click 'Add Achievement' to get started." />
          : (
            <div className="card-grid-3">
              {achievements.map((a, idx) => (
                <RevealSection key={a.id} direction="from-bottom" delay={`${idx * 0.1}s`}>
                  <div className="glass portfolio-card glow-hover">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 grid place-items-center shrink-0">
                        <i className="fa-solid fa-trophy text-amber-400" />
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(a)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                          <button onClick={() => setDeleteTarget(a)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-semibold mt-3 mb-2">{a.title}</h3>
                    {a.description && <p className="text-sm text-slate-400 leading-relaxed">{a.description}</p>}
                  </div>
                </RevealSection>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Achievement' : 'Add Achievement'} icon="fa-solid fa-trophy">
        <form onSubmit={save} className="space-y-4">
          <Field label="Title" error={errors.title}><Input name="title" value={form.title} onChange={change} error={errors.title} placeholder="e.g. Best Intern Award" /></Field>
          <Field label="Description"><Textarea name="description" rows={3} value={form.description} onChange={change} placeholder="Brief description…" /></Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={`Delete "${deleteTarget?.title}"?`} />
    </section>
  )
}
