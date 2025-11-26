import api from './apiInstance';

// Poll payment status by checkoutRequestId
export const pollPaymentStatus = async (checkoutRequestId: string): Promise<{ status: string; payment?: any }> => {
  const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
  return response.data;
};
