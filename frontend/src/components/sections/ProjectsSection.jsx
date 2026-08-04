import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, Textarea, ImageDrop, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { title: '', description: '', technologies: '', github_link: '', live_link: '', featured: false }

export default function ProjectsSection({ hook }) {
  const { isAdmin } = useAuth()
  const { projects, create, update, remove, uploadImage } = hook

  const [modalOpen,      setModalOpen]      = useState(false)
  const [editing,        setEditing]        = useState(null)
  const [form,           setForm]           = useState({ ...EMPTY })
  const [errors,         setErrors]         = useState({})
  const [saving,         setSaving]         = useState(false)
  const [imgFile,        setImgFile]        = useState(null)
  const [imgPreview,     setImgPreview]     = useState('')
  const [previewProject, setPreviewProject] = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setImgFile(null); setImgPreview(''); setErrors({}); setModalOpen(true) }
  const openEdit   = (p) => {
    setEditing(p)
    setForm({ title: p.title, description: p.description || '', technologies: (p.technologies || []).join(', '), github_link: p.github_link || '', live_link: p.live_link || '', featured: !!p.featured })
    setImgFile(null); setImgPreview(p.image || ''); setErrors({}); setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm({ ...EMPTY }); setImgFile(null); setImgPreview(''); setErrors({}) }
  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Project title is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (form.github_link && !/^https?:\/\//.test(form.github_link)) e.github_link = 'URL must start with http(s)://'
    if (form.live_link   && !/^https?:\/\//.test(form.live_link))   e.live_link   = 'URL must start with http(s)://'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      const payload = { ...form, technologies: form.technologies.split(',').map(s => s.trim()).filter(Boolean) }
      let saved
      if (editing) { saved = await update(editing.id, payload); toast.success('Project updated') }
      else         { saved = await create(payload);              toast.success('Project added')   }
      if (imgFile && saved?.id) await uploadImage(saved.id, imgFile)
      closeModal()
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Project deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  return (
    <section id="projects" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-80 h-80 bg-brandpurple/15 top-20 right-0 absolute" />
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div><h2 className="text-3xl font-display font-bold section-heading">Projects</h2></div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Project</button>}
          </div>
        </RevealSection>

        {projects.length === 0
          ? <EmptyState icon="fa-solid fa-folder-open" title="No projects yet" description={isAdmin ? "Click 'Add Project' to get started." : 'Check back soon.'} />
          : (
            <div className="card-grid-2">
              {projects.map((project, idx) => (
                <RevealSection key={project.id} direction={idx % 2 === 0 ? 'from-left' : 'from-right'} delay={`${(idx % 2) * 0.15}s`}>
                  <article className="glass portfolio-card-media project-card glow-hover group cursor-pointer" onClick={() => setPreviewProject(project)}>
                    <div className="aspect-video bg-white/5 overflow-hidden relative">
                      {project.image
                        ? <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        : <div className="w-full h-full grid place-items-center bg-gradient-to-br from-brandblue/10 to-brandpurple/10"><i className="fa-solid fa-code text-4xl text-slate-500 group-hover:text-brandpurple transition-colors duration-300" /></div>
                      }
                    </div>
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-semibold text-xl group-hover:text-brandpurple transition-colors">{project.title}</h3>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(project)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                            <button onClick={() => setDeleteTarget(project)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-4 flex-1 leading-relaxed">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">{project.technologies.map(t => <span key={t} className="skill-pill">{t}</span>)}</div>
                      )}
                      <div className="flex gap-3 pt-1 border-t border-white/5" onClick={e => e.stopPropagation()}>
                        {project.github_link && <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2 text-sm mt-3"><i className="fa-brands fa-github" /> Code</a>}
                        {project.live_link   && <a href={project.live_link}   target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2 text-sm mt-3"><i className="fa-solid fa-arrow-up-right-from-square" /> Live</a>}
                      </div>
                    </div>
                  </article>
                </RevealSection>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Project' : 'Add Project'} icon="fa-solid fa-folder">
        <form onSubmit={save} className="space-y-4">
          <Field label="Project title" error={errors.title}><Input name="title" value={form.title} onChange={change} error={errors.title} /></Field>
          <Field label="Description"   error={errors.description}><Textarea name="description" rows={4} value={form.description} onChange={change} error={errors.description} /></Field>
          <Field label="Project image"><ImageDrop value={imgPreview} onChange={(file, preview) => { setImgFile(file); setImgPreview(preview) }} label="Upload project image" /></Field>
          <Field label="Technologies" hint="Comma-separated"><Input name="technologies" value={form.technologies} onChange={change} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="GitHub link" error={errors.github_link}><Input name="github_link" value={form.github_link} onChange={change} error={errors.github_link} placeholder="https://github.com/..." /></Field>
            <Field label="Live demo"   error={errors.live_link}>  <Input name="live_link"   value={form.live_link}   onChange={change} error={errors.live_link}   placeholder="https://..." /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured} onChange={change} className="accent-brandpurple w-4 h-4" />
            Mark as featured project
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!previewProject} onClose={() => setPreviewProject(null)} title={previewProject?.title || ''} icon="fa-solid fa-folder-open" wide>
        {previewProject && (
          <div>
            {previewProject.image
              ? <img src={previewProject.image} alt={previewProject.title} className="w-full rounded-xl mb-6 max-h-64 object-cover border border-white/10" />
              : <div className="w-full rounded-xl mb-6 h-36 bg-gradient-to-br from-brandblue/20 to-brandpurple/20 border border-white/10 grid place-items-center"><i className="fa-solid fa-code text-5xl text-brandpurple opacity-60" /></div>
            }
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{previewProject.description}</p>
            {previewProject.technologies?.length > 0 && <div className="flex flex-wrap gap-2 mb-4">{previewProject.technologies.map(t => <span key={t} className="skill-pill">{t}</span>)}</div>}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              {previewProject.github_link && <a href={previewProject.github_link} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 justify-center"><i className="fa-brands fa-github" /> GitHub</a>}
              {previewProject.live_link   && <a href={previewProject.live_link}   target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 justify-center"><i className="fa-solid fa-arrow-up-right-from-square" /> Live Demo</a>}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={`Delete "${deleteTarget?.title}"?`} />
    </section>
  )
}
