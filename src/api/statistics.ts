import apiInstance from './apiInstance';

export const fetchActiveUsersStats = async () => {
  const res = await apiInstance.get('/statistics/active-users');
  return res.data;
};

export const fetchEngagedCustomersStats = async () => {
  const res = await apiInstance.get('/statistics/engaged-customers');
  return res.data;
};

export const fetchPackagePopularityStats = async () => {
  const res = await apiInstance.get('/statistics/package-popularity');
  return res.data;
};

// Customer Emotions & Sentiment
export const fetchCustomerEmotionsStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/customer-emotions?${params.toString()}`);
  return res.data;
};

export const fetchEmotionalTonesStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/emotional-tones?${params.toString()}`);
  return res.data;
};

// AI Personalized Response Stats
export const fetchPersonalizedResponseStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/personalized-responses?${params.toString()}`);
  return res.data;
};

// AI Performance Stats
export const fetchAIPerformanceStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/ai-performance?${params.toString()}`);
  return res.data;
};

// System-wide Stats
export const fetchSystemStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/system?${params.toString()}`);
  return res.data;
};

// Comprehensive Stats (all in one)
export const fetchComprehensiveStats = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const res = await apiInstance.get(`/statistics/comprehensive?${params.toString()}`);
  return res.data;
};