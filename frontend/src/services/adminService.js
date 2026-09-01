import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminItems = async (params = {}) => {
  const response = await api.get('/admin/items', { params });
  return response.data;
};

export const updateAdminItemStatus = async (id, status) => {
  const response = await api.put(`/admin/items/${id}/status`, { status });
  return response.data;
};

export const deleteAdminItem = async (id) => {
  const response = await api.delete(`/admin/items/${id}`);
  return response.data;
};

export const getAdminClaims = async (params = {}) => {
  const response = await api.get('/admin/claims', { params });
  return response.data;
};
