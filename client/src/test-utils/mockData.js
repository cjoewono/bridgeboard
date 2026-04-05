export const mockJob = {
  id: 1,
  company: 'Lockheed Martin',
  title: 'Systems Engineer',
  status: 'applied',
  user: 1,
};

export const mockTask = {
  id: 10,
  job: 1,
  title: 'Submit resume',
  completed: false,
};

export const mockNote = {
  id: 20,
  job: 1,
  content: 'Phone screen went well',
  interview_date: '2026-04-10',
};

export const mockContact = {
  id: 1,
  name: 'Jane Smith',
  company: 'Raytheon',
  email: 'jane@raytheon.com',
  notes: 'Met at FourBlock event',
  user: 1,
};

export const mockAdzunaResult = {
  id: 'az001',
  title: 'Logistics Manager',
  company: { display_name: 'Boeing' },
  location: { display_name: 'Seattle, WA' },
  description: 'Manage logistics operations for defense programs.',
  redirect_url: 'https://www.adzuna.com/details/az001',
};

export const mockTranslationResult = {
  branch: 'Army',
  code: '11B',
  military_title: 'Infantryman',
  summary: 'Leads and executes ground combat operations. Highly transferable leadership and logistics skills.',
  civilian_job_titles: ['Security Manager', 'Operations Analyst', 'Logistics Coordinator'],
  transferable_skills: ['Team Leadership', 'Risk Assessment', 'Physical Security', 'Mission Planning'],
  suggested_keywords: ['operations', 'leadership', 'security', 'logistics'],
};
