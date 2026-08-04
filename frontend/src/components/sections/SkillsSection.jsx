import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { skill_name: '', category: '', level: 80, icon: 'fa-solid fa-code' }
const ICONS = [
  'fa-brands fa-java','fa-brands fa-python','fa-brands fa-js','fa-brands fa-react','fa-brands fa-node-js',
  'fa-brands fa-html5','fa-brands fa-css3-alt','fa-brands fa-git-alt','fa-brands fa-docker','fa-brands fa-aws',
  'fa-solid fa-brain','fa-solid fa-database','fa-solid fa-server','fa-solid fa-code','fa-solid fa-chart-line',
]

export default function SkillsSection({ hook }) {
  const { isAdmin } = useAuth()
  const { skills, create, update, remove, reorder } = hook

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState({ ...EMPTY })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const dragIdx = useRef(null)
  const [overIdx, setOverIdx] = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setErrors({}); setModalOpen(true) }
  const openEdit   = (s) => { setEditing(s); setForm({ skill_name: s.skill_name, category: s.category, level: s.level, icon: s.icon }); setErrors({}); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ ...EMPTY }); setErrors({}) }
  const change = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'level' ? Number(value) : value }))
  }

  const validate = () => {
    const e = {}
    if (!form.skill_name?.trim()) e.skill_name = 'Skill name is required.'
    if (!form.category?.trim())   e.category   = 'Category is required.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      if (editing) { await update(editing.id, form); toast.success('Skill updated') }
      else         { await create(form);              toast.success('Skill added')   }
      closeModal()
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Skill deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  const onDrop = async (toIdx) => {
    const from = dragIdx.current
    if (from === null || from === toIdx) { setOverIdx(null); return }
    const next = [...skills]
    const [moved] = next.splice(from, 1)
    next.splice(toIdx, 0, moved)
    dragIdx.current = null; setOverIdx(null)
    try { await reorder(next.map(s => s.id)); toast.success('Order updated') }
    catch (err) { toast.error(err.message || 'Reorder failed.') }
  }

  return (
    <section id="skills" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-72 h-72 bg-brandblue/15 bottom-0 left-10 absolute" />
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div>
              <h2 className="text-3xl font-display font-bold section-heading">Skills</h2>
              {isAdmin && <p className="text-xs text-slate-500 mt-1"><i className="fa-solid fa-arrows-up-down-left-right mr-1" />Drag to reorder</p>}
            </div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Skill</button>}
          </div>
        </RevealSection>

        {skills.length === 0
          ? <EmptyState icon="fa-solid fa-code" title="No skills yet" description={isAdmin ? "Click 'Add Skill' to get started." : 'Check back soon.'} />
          : (
            <div className="card-grid-3">
              {skills.map((skill, i) => (
                <RevealSection key={skill.id} direction="from-bottom" delay={`${i * 0.07}s`}>
                  <div
                    draggable={isAdmin}
                    onDragStart={() => { dragIdx.current = i }}
                    onDragOver={(e) => { e.preventDefault(); setOverIdx(i) }}
                    onDrop={() => onDrop(i)}
                    className={`glass portfolio-card glow-hover ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''} ${overIdx === i ? 'drop-target' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-lg shadow-brandpurple/20">
                          <i className={`${skill.icon || 'fa-solid fa-code'} text-white text-lg`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{skill.skill_name}</p>
                          <span className="skill-pill mt-1">{skill.category}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(skill)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                          <button onClick={() => setDeleteTarget(skill)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Skill' : 'Add Skill'} icon="fa-solid fa-code">
        <form onSubmit={save} className="space-y-4">
          <Field label="Skill name" error={errors.skill_name}><Input name="skill_name" value={form.skill_name} onChange={change} error={errors.skill_name} placeholder="e.g. Java" /></Field>
          <Field label="Category"   error={errors.category}>  <Input name="category"   value={form.category}   onChange={change} error={errors.category}   placeholder="e.g. Languages" /></Field>
          <Field label={`Proficiency: ${form.level}%`}>
            <input type="range" name="level" min={0} max={100} value={form.level} onChange={change} className="w-full accent-brandpurple" />
          </Field>
          <Field label="Icon">
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button type="button" key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-10 h-10 rounded-xl grid place-items-center border transition-colors ${form.icon === ic ? 'bg-gradient-primary border-transparent text-white' : 'border-white/10 hover:border-white/30'}`}>
                  <i className={ic} />
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={`Delete "${deleteTarget?.skill_name}"?`} />
    </section>
  )
}
