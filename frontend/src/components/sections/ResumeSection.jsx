import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { RevealSection, ConfirmDialog } from '../ui'

export default function ResumeSection({ hook }) {
  const { isAdmin } = useAuth()
  const { resume, upload, remove } = hook
  const inputRef = useRef(null)
  const [uploading,  setUploading]  = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const handleUpload = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted.'); return }
    setUploading(true)
    try {
      await upload(file)
      toast.success('Resume uploaded successfully')
    } catch (err) {
      toast.error(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await remove()
      toast.success('Resume deleted')
    } catch (err) {
      toast.error(err.message || 'Delete failed.')
    } finally {
      setConfirmDel(false)
    }
  }

  return (
    <section id="resume" className="portfolio-section py-20 scroll-mt-20">
      <div className="section-inner">
        <RevealSection direction="from-bottom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold section-heading">Resume</h2>
          </div>
        </RevealSection>
        <RevealSection direction="from-zoom" delay="0.1s">
          <div className="glass rounded-3xl p-8 sm:p-10 max-w-xl mx-auto text-center glow-hover">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-primary grid place-items-center mb-5">
              <i className="fa-solid fa-file-pdf text-white text-2xl" />
            </div>
            {resume?.file_name
              ? (<>
                  <p className="font-medium mb-1">{resume.file_name}</p>
                  <p className="text-xs text-slate-500 mb-6">Last updated: {new Date(resume.updated_at).toLocaleDateString()}</p>
                </>)
              : <p className="text-sm text-slate-400 mb-6">No resume uploaded yet.</p>
            }
            <div className="flex flex-wrap justify-center gap-4">
              {resume?.resume_file && (
                <a href={resume.resume_file} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <i className="fa-solid fa-download" /> Download Resume
                </a>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-outline disabled:opacity-60">
                    {uploading ? <><i className="fa-solid fa-spinner animate-spin" /> Uploading…</> : <><i className="fa-solid fa-upload" /> Upload Resume (PDF)</>}
                  </button>
                  {resume?.resume_file && (
                    <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/40 hover:bg-rose-500/10 transition-colors">
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  )}
                  <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleUpload(e.target.files?.[0])} />
                </>
              )}
            </div>
          </div>
        </RevealSection>
      </div>
      <ConfirmDialog open={confirmDel} onCancel={() => setConfirmDel(false)} onConfirm={handleDelete} title="Delete resume?" description="This will permanently remove the uploaded resume." />
    </section>
  )
}
