import apiClient from './api';

const PAYMENT_PREFIX = '/payments';

export const createPaymentIntent = async (orderId) => {
  try {
    const response = await apiClient.post(`${PAYMENT_PREFIX}/create-payment-intent`, { orderId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create payment intent' };
  }
};
