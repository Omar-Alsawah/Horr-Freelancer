export function calculateProfileCompletion(profile, skills, portfolio) {
  let score = 0;
  if (profile?.fullName)              score += 10;
  if (profile?.title)                 score += 10;
  if (profile?.bio)                   score += 10;
  if (profile?.city)                  score += 10;
  if (profile?.country)               score += 10;
  
  const skillsList = Array.isArray(skills) ? skills : (skills?.data || []);
  const portfolioList = Array.isArray(portfolio) ? portfolio : (portfolio?.data || []);
  
  if (skillsList.length > 0)             score += 15;
  if (portfolioList.length > 0)          score += 15;
  if (profile?.isVerified === true)      score += 20;
  return score;
}

export function getMissingProfileCriteria(profile, skills, portfolio) {
  const missing = [];
  if (!profile?.fullName) missing.push({ id: 'fullName', label: 'Add your full name', link: '/profile' });
  if (!profile?.title) missing.push({ id: 'title', label: 'Add a professional title', link: '/profile' });
  if (!profile?.bio) missing.push({ id: 'bio', label: 'Write your bio', link: '/profile' });
  if (!profile?.city || !profile?.country) missing.push({ id: 'location', label: 'Add your location', link: '/settings' });
  
  const skillsList = Array.isArray(skills) ? skills : (skills?.data || []);
  const portfolioList = Array.isArray(portfolio) ? portfolio : (portfolio?.data || []);
  
  if (skillsList.length === 0) missing.push({ id: 'skills', label: 'Add at least one skill', link: '/profile' });
  if (portfolioList.length === 0) missing.push({ id: 'portfolio', label: 'Add a portfolio project', link: '/profile' });
  if (profile?.isVerified !== true) missing.push({ id: 'verify', label: 'Verify your identity', link: '/settings/verification' });
  return missing;
}
