/**
 * usePortfolioData
 *
 * Master hook — composes all individual section hooks.
 * Each section subscribes to Supabase Realtime independently,
 * so any change in the database is reflected instantly without
 * a page reload or GitHub redeploy.
 */
import { useProfile }      from './useProfile';
import { useSkills }       from './useSkills';
import { useProjects }     from './useProjects';
import { useEducation }    from './useEducation';
import { useExperience }   from './useExperience';
import { useCertificates } from './useCertificates';
import { useAchievements } from './useAchievements';
import { useResume }       from './useResume';

export function usePortfolioData() {
  const profileHook      = useProfile();
  const skillsHook       = useSkills();
  const projectsHook     = useProjects();
  const educationHook    = useEducation();
  const experienceHook   = useExperience();
  const certificatesHook = useCertificates();
  const achievementsHook = useAchievements();
  const resumeHook       = useResume();

  const loading = [
    profileHook.loading,
    skillsHook.loading,
    projectsHook.loading,
    educationHook.loading,
    experienceHook.loading,
    certificatesHook.loading,
    achievementsHook.loading,
    resumeHook.loading,
  ].some(Boolean);

  const error =
    profileHook.error      ||
    skillsHook.error       ||
    projectsHook.error     ||
    educationHook.error    ||
    experienceHook.error   ||
    certificatesHook.error ||
    achievementsHook.error ||
    resumeHook.error       ||
    null;

  const fetchAll = () => {
    profileHook.refetch();
    skillsHook.refetch();
    projectsHook.refetch();
    educationHook.refetch();
    experienceHook.refetch();
    certificatesHook.refetch();
    achievementsHook.refetch();
    resumeHook.refetch();
  };

  return {
    // raw data
    data: {
      profile:      profileHook.profile,
      skills:       skillsHook.skills,
      projects:     projectsHook.projects,
      education:    educationHook.education,
      experience:   experienceHook.experience,
      certificates: certificatesHook.certificates,
      achievements: achievementsHook.achievements,
      resume:       resumeHook.resume,
    },
    loading,
    error,
    fetchAll,

    // per-section hook objects (sections call these directly)
    hooks: {
      profile:      profileHook,
      skills:       skillsHook,
      projects:     projectsHook,
      education:    educationHook,
      experience:   experienceHook,
      certificates: certificatesHook,
      achievements: achievementsHook,
      resume:       resumeHook,
    },
  };
}
