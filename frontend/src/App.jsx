import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { usePortfolioData }      from './hooks/usePortfolioData'
import { useScrollReveal }       from './components/ui'

// Layout
import Nav    from './components/sections/Nav'
import Footer from './components/sections/Footer'

// Portfolio sections
import ProfileSection      from './components/sections/ProfileSection'
import ResumeSection       from './components/sections/ResumeSection'
import SkillsSection       from './components/sections/SkillsSection'
import EducationSection    from './components/sections/EducationSection'
import ExperienceSection   from './components/sections/ExperienceSection'
import ProjectsSection     from './components/sections/ProjectsSection'
import CertificatesSection from './components/sections/CertificatesSection'
import AchievementsSection from './components/sections/AchievementsSection'
import ContactSection      from './components/sections/ContactSection'

// Admin UI
import AdminPasswordDialog from './components/ui/AdminPasswordDialog'
import AdminMessages       from './pages/AdminMessages'

// Shared UI
import { LoadingScreen, SkeletonCard } from './components/ui'

/* ── Admin toggle (fixed bottom-left) ── */
function AdminToggle({ onRequestToggle }) {
  const { isAdmin } = useAuth()
  return (
    <button
      onClick={onRequestToggle}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        borderRadius: '9999px',
        fontWeight: '600',
        fontSize: '13px',
        color: '#ffffff',
        cursor: 'pointer',
        background: isAdmin
          ? 'linear-gradient(135deg, #3B5BFF, #8B5CF6)'
          : 'linear-gradient(135deg, #1e1b4b, #312e81)',
        border: '2px solid',
        borderColor: isAdmin ? '#8B5CF6' : '#6d28d9',
        boxShadow: isAdmin
          ? '0 0 20px rgba(139,92,246,0.6), 0 4px 20px rgba(0,0,0,0.4)'
          : '0 0 12px rgba(109,40,217,0.4), 0 4px 20px rgba(0,0,0,0.4)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <i className={`fa-solid ${isAdmin ? 'fa-lock-open' : 'fa-lock'}`} style={{ fontSize: '13px' }} />
      {isAdmin ? 'Admin mode: ON' : 'Admin mode: OFF'}
    </button>
  )
}

/* ── Error screen ── */
function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center p-8">
      <div className="glass rounded-3xl p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/15 grid place-items-center mb-5">
          <i className="fa-solid fa-triangle-exclamation text-rose-400 text-2xl" />
        </div>
        <h2 className="font-display font-bold text-xl mb-2">Failed to load portfolio</h2>
        <p className="text-sm text-slate-400 mb-2">{message}</p>
        <p className="text-xs text-slate-600 mb-6">Check your Supabase environment variables.</p>
        <button onClick={onRetry} className="btn-primary">
          <i className="fa-solid fa-rotate-right" /> Try Again
        </button>
      </div>
    </div>
  )
}

/* ── Skeleton loading ── */
function SkeletonPage() {
  return (
    <div className="pt-24 space-y-16 max-w-6xl mx-auto px-5 pb-20">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-4">
          <div className="skeleton h-8 rounded-full w-48" />
          <div className="card-grid-3">{[1, 2, 3].map(j => <SkeletonCard key={j} />)}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Main portfolio ── */
function PortfolioPage() {
  const { isAdmin } = useAuth()
  const { data, loading, error, fetchAll, hooks } = usePortfolioData()
  const [authOpen,     setAuthOpen]     = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)

  useScrollReveal()

  const adminToggle = <AdminToggle onRequestToggle={() => setAuthOpen(true)} />
  const authDialog  = <AdminPasswordDialog open={authOpen} onClose={() => setAuthOpen(false)} />

  if (error) return (
    <>
      <ErrorScreen message={error} onRetry={fetchAll} />
      {adminToggle}{authDialog}
    </>
  )

  return (
    <>
      <LoadingScreen show={loading} />

      {!loading && (
        <>
          <Nav />
          <main className="pt-16">
            <ProfileSection      hook={hooks.profile}      />
            <ResumeSection       hook={hooks.resume}       />
            <SkillsSection       hook={hooks.skills}       />
            <ExperienceSection   hook={hooks.experience}   />
            <ProjectsSection     hook={hooks.projects}     />
            <CertificatesSection hook={hooks.certificates} />
            <EducationSection    hook={hooks.education}    />
            <AchievementsSection hook={hooks.achievements} />
            <ContactSection />
          </main>

          <Footer
            profile={data.profile}
            onRefresh={hooks.profile.refetch}
            onAdminToggle={() => setAuthOpen(true)}
            onMessagesOpen={() => setMessagesOpen(true)}
          />

          {isAdmin && messagesOpen && (
            <AdminMessages onClose={() => setMessagesOpen(false)} />
          )}
        </>
      )}

      {loading && <SkeletonPage />}

      {/* Always visible — even during load and error states */}
      {adminToggle}
      {authDialog}
    </>
  )
}

/* ── Root ── */
export default function App() {
  return (
    <AuthProvider>
      <PortfolioPage />
    </AuthProvider>
  )
}
