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
