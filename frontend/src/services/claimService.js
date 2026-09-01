import api from './api';

export const createClaim = async (claimData) => {
  const response = await api.post('/claims', claimData);
  return response.data;
};

export const getMyClaims = async () => {
  const response = await api.get('/claims/my');
  return response.data;
};

export const getClaimById = async (id) => {
  const response = await api.get(`/claims/${id}`);
  return response.data;
};

export const updateClaimStatus = async (id, status) => {
  const response = await api.put(`/claims/${id}`, { status });
  return response.data;
};

export const deleteClaim = async (id) => {
  const response = await api.delete(`/claims/${id}`);
  return response.data;
};
