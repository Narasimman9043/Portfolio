import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, Modal, Field, Input, ImageDrop, ConfirmDialog, EmptyState } from '../ui'

const EMPTY = { title: '', issuer: '', issue_date: '', credential_id: '', certificate_url: '' }

export default function CertificatesSection({ hook }) {
  const { isAdmin } = useAuth()
  const { certificates, create, update, remove, uploadImage } = hook

  const [modalOpen,    setModalOpen]    = useState(false)
  const [previewCert,  setPreviewCert]  = useState(null)
  const [editing,      setEditing]      = useState(null)
  const [form,         setForm]         = useState({ ...EMPTY })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [imgFile,      setImgFile]      = useState(null)
  const [imgPreview,   setImgPreview]   = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY }); setImgFile(null); setImgPreview(''); setErrors({}); setModalOpen(true) }
  const openEdit   = (c) => { setEditing(c); setForm({ title: c.title, issuer: c.issuer, issue_date: c.issue_date || '', credential_id: c.credential_id || '', certificate_url: c.certificate_url || '' }); setImgFile(null); setImgPreview(c.certificate_image || ''); setErrors({}); setModalOpen(true) }
  const change     = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())  e.title  = 'Certificate name is required.'
    if (!form.issuer.trim()) e.issuer = 'Organization is required.'
    if (form.certificate_url && !/^https?:\/\//.test(form.certificate_url)) e.certificate_url = 'URL must start with http(s)://'
    setErrors(e); return Object.keys(e).length === 0
  }

  const save = async (ev) => {
    ev.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    setSaving(true)
    try {
      let saved
      if (editing) { saved = await update(editing.id, form); toast.success('Certificate updated') }
      else         { saved = await create(form);              toast.success('Certificate added')   }
      if (imgFile && saved?.id) await uploadImage(saved.id, imgFile)
      setModalOpen(false)
    } catch (err) { toast.error(err.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    try { await remove(deleteTarget.id); toast.success('Certificate deleted') }
    catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  return (
    <section id="certificates" className="portfolio-section py-20 scroll-mt-20">
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="section-header">
            <div><h2 className="text-3xl font-display font-bold section-heading">Certificates</h2></div>
            {isAdmin && <button onClick={openCreate} className="btn-primary"><i className="fa-solid fa-plus" /> Add Certificate</button>}
          </div>
        </RevealSection>

        {certificates.length === 0
          ? <EmptyState icon="fa-solid fa-award" title="No certificates yet" description={isAdmin ? "Click 'Add Certificate' to get started." : 'Check back soon.'} />
          : (
            <div className="card-grid-3">
              {certificates.map((cert, idx) => (
                <RevealSection key={cert.id} direction="from-bottom" delay={`${idx * 0.1}s`}>
                  <div className="glass portfolio-card-media project-card glow-hover group cursor-pointer" onClick={() => setPreviewCert(cert)}>
                    <div className="aspect-video bg-white/5 overflow-hidden">
                      {cert.certificate_image
                        ? <img src={cert.certificate_image} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full grid place-items-center"><i className="fa-solid fa-award text-3xl text-slate-500 group-hover:text-brandpurple transition-colors duration-300" /></div>
                      }
                    </div>
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{cert.title}</h3>
                          <p className="text-sm text-brandpurple truncate">{cert.issuer}</p>
                          <p className="text-xs text-slate-500 mt-1">{cert.issue_date}</p>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(cert)} className="icon-btn hover:bg-white/10"><i className="fa-solid fa-pen text-xs" /></button>
                            <button onClick={() => setDeleteTarget(cert)} className="icon-btn hover:bg-rose-500/10 text-rose-400"><i className="fa-solid fa-trash text-xs" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Certificate' : 'Add Certificate'} icon="fa-solid fa-award">
        <form onSubmit={save} className="space-y-4">
          <Field label="Certificate name" error={errors.title}> <Input name="title"  value={form.title}  onChange={change} error={errors.title}  /></Field>
          <Field label="Organization"     error={errors.issuer}><Input name="issuer" value={form.issuer} onChange={change} error={errors.issuer} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Issue date">    <Input type="month" name="issue_date"    value={form.issue_date}    onChange={change} /></Field>
            <Field label="Credential ID"><Input              name="credential_id" value={form.credential_id} onChange={change} /></Field>
          </div>
          <Field label="Certificate image"><ImageDrop value={imgPreview} onChange={(file, preview) => { setImgFile(file); setImgPreview(preview) }} label="Upload certificate image" /></Field>
          <Field label="Certificate URL" error={errors.certificate_url}>
            <Input name="certificate_url" value={form.certificate_url} onChange={change} error={errors.certificate_url} placeholder="https://..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {saving ? <><i className="fa-solid fa-spinner animate-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save</>}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!previewCert} onClose={() => setPreviewCert(null)} title={previewCert?.title || ''} icon="fa-solid fa-award" wide>
        {previewCert && (
          <div>
            {previewCert.certificate_image
              ? <img src={previewCert.certificate_image} alt={previewCert.title} className="w-full rounded-xl mb-6 max-h-72 object-contain bg-white/5 border border-white/10" />
              : <div className="w-full rounded-xl mb-6 h-36 bg-gradient-to-br from-brandblue/20 to-brandpurple/20 border border-white/10 grid place-items-center"><i className="fa-solid fa-award text-5xl text-brandpurple opacity-60" /></div>
            }
            <h3 className="font-display font-bold text-xl mb-1">{previewCert.title}</h3>
            <p className="text-brandpurple font-medium mb-4">{previewCert.issuer}</p>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="glass rounded-xl p-4"><dt className="text-slate-500 text-xs uppercase tracking-wider mb-1">Issue Date</dt><dd>{previewCert.issue_date || '—'}</dd></div>
              <div className="glass rounded-xl p-4"><dt className="text-slate-500 text-xs uppercase tracking-wider mb-1">Credential ID</dt><dd className="break-all">{previewCert.credential_id || '—'}</dd></div>
            </dl>
            {previewCert.certificate_url && (
              <div className="mt-6">
                <a href={previewCert.certificate_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
                  <i className="fa-solid fa-certificate" /> View & Verify Certificate
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={`Delete "${deleteTarget?.title}"?`} />
    </section>
  )
}
