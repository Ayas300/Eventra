import apiClient from './api';

const ORDER_PREFIX = '/orders';

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post(ORDER_PREFIX, orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create order' };
  }
};
