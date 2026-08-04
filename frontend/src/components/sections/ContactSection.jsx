import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { submitContact } from '../../services/contactService'
import { RevealSection, Field, Input, Textarea } from '../ui'

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function ContactSection() {
  const [form,    setForm]    = useState({ ...EMPTY })
  const [errors,  setErrors]  = useState({})
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required.'
    if (!form.email.trim())   e.email   = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.message.trim()) e.message = 'Message is required.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSending(true)
    try {
      await submitContact(form)
      setSent(true)
      setForm({ ...EMPTY })
      toast.success("Message sent! I'll get back to you soon.")
    } catch (err) {
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="portfolio-section py-20 scroll-mt-20 relative overflow-hidden">
      <div className="orb w-72 h-72 bg-brandpurple/15 top-0 right-0 absolute" />
      <div className="section-inner" style={{ maxWidth: '48rem' }}>
        <RevealSection direction="from-bottom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold section-heading">Get In Touch</h2>
            <p className="text-slate-400 text-sm mt-3">Have a project in mind or just want to say hello? Drop me a message.</p>
          </div>
        </RevealSection>

        <RevealSection direction="from-zoom" delay="0.1s">
          {sent ? (
            <div className="glass rounded-3xl p-10 text-center glow-hover">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 grid place-items-center mb-5">
                <i className="fa-solid fa-circle-check text-emerald-400 text-3xl" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Message Sent!</h3>
              <p className="text-slate-400 text-sm mb-6">Thanks for reaching out. I'll respond as soon as possible.</p>
              <button onClick={() => setSent(false)} className="btn-outline">Send Another Message</button>
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 sm:p-10 glow-hover">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Your name"  error={errors.name}> <Input name="name"  value={form.name}  onChange={change} error={errors.name}  placeholder="Narasimman R" /></Field>
                  <Field label="Your email" error={errors.email}><Input type="email" name="email" value={form.email} onChange={change} error={errors.email} placeholder="you@example.com" /></Field>
                </div>
                <Field label="Subject"><Input name="subject" value={form.subject} onChange={change} placeholder="Project inquiry, collaboration, etc." /></Field>
                <Field label="Message" error={errors.message}>
                  <Textarea name="message" rows={5} value={form.message} onChange={change} error={errors.message} placeholder="Tell me about your project or question…" />
                </Field>
                <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-60">
                  {sending ? <><i className="fa-solid fa-spinner animate-spin" /> Sending…</> : <><i className="fa-solid fa-paper-plane" /> Send Message</>}
                </button>
              </form>
            </div>
          )}
        </RevealSection>
      </div>
    </section>
  )
}
