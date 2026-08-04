import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginAdmin  = (creds) => api.post('/api/auth/login', creds);
export const logoutAdmin = ()       => api.post('/api/auth/logout');
export const getMe       = ()       => api.get('/api/auth/me');

// ── Profile ───────────────────────────────────────────────────────────────
export const getProfile    = ()     => api.get('/api/profile');
export const updateProfile = (data) => api.put('/api/profile', data);
export const uploadPhoto   = (file) => {
  const f = new FormData(); f.append('image', file);
  return api.post('/api/profile/image', f);
};

// ── Skills ────────────────────────────────────────────────────────────────
export const getSkills     = ()           => api.get('/api/skills');
export const createSkill   = (data)       => api.post('/api/skills', data);
export const updateSkill   = (id, data)   => api.put(`/api/skills/${id}`, data);
export const deleteSkill   = (id)         => api.delete(`/api/skills/${id}`);
export const reorderSkills = (ids)        => api.put('/api/skills/reorder', { ordered_ids: ids });

// ── Education ─────────────────────────────────────────────────────────────
export const getEducation    = ()           => api.get('/api/education');
export const createEducation = (data)       => api.post('/api/education', data);
export const updateEducation = (id, data)   => api.put(`/api/education/${id}`, data);
export const deleteEducation = (id)         => api.delete(`/api/education/${id}`);

// ── Experience (Internships) ──────────────────────────────────────────────
export const getExperience    = ()             => api.get('/api/experience');
export const createExperience = (data)         => api.post('/api/experience', data);
export const updateExperience = (id, data)     => api.put(`/api/experience/${id}`, data);
export const deleteExperience = (id)           => api.delete(`/api/experience/${id}`);
export const uploadExpLogo    = (id, file)     => {
  const f = new FormData(); f.append('image', file);
  return api.post(`/api/experience/${id}/logo`, f);
};

// ── Projects ──────────────────────────────────────────────────────────────
export const getProjects        = ()           => api.get('/api/projects');
export const createProject      = (data)       => api.post('/api/projects', data);
export const updateProject      = (id, data)   => api.put(`/api/projects/${id}`, data);
export const deleteProject      = (id)         => api.delete(`/api/projects/${id}`);
export const uploadProjectImage = (id, file)   => {
  const f = new FormData(); f.append('image', file);
  return api.post(`/api/projects/${id}/image`, f);
};

// ── Certificates ──────────────────────────────────────────────────────────
export const getCertificates   = ()           => api.get('/api/certificates');
export const createCertificate = (data)       => api.post('/api/certificates', data);
export const updateCertificate = (id, data)   => api.put(`/api/certificates/${id}`, data);
export const deleteCertificate = (id)         => api.delete(`/api/certificates/${id}`);
export const uploadCertImage   = (id, file)   => {
  const f = new FormData(); f.append('image', file);
  return api.post(`/api/certificates/${id}/image`, f);
};

// ── Resume ────────────────────────────────────────────────────────────────
export const getResume    = ()     => api.get('/api/resume');
export const uploadResume = (file) => {
  const f = new FormData(); f.append('resume', file);
  return api.post('/api/resume', f);
};
export const deleteResume = () => api.delete('/api/resume');

// ── Contact ───────────────────────────────────────────────────────────────
export const submitContact = (data) => api.post('/api/contact', data);
export const getMessages   = ()     => api.get('/api/contact');
export const markRead      = (id)   => api.patch(`/api/contact/${id}/read`);
export const deleteMessage = (id)   => api.delete(`/api/contact/${id}`);

// ── Achievements ──────────────────────────────────────────────────────────
export const getAchievements    = ()           => api.get('/api/achievements');
export const createAchievement  = (data)       => api.post('/api/achievements', data);
export const updateAchievement  = (id, data)   => api.put(`/api/achievements/${id}`, data);
export const deleteAchievement  = (id)         => api.delete(`/api/achievements/${id}`);

// ── Social Links ──────────────────────────────────────────────────────────
export const getSocialLinks   = ()     => api.get('/api/social-links');
export const upsertSocialLink = (data) => api.post('/api/social-links', data);
export const deleteSocialLink = (id)   => api.delete(`/api/social-links/${id}`);
