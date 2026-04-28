import apiClient from './api';

const EVENT_PREFIX = '/events';

export const fetchMyEvents = async () => {
  try {
    const response = await apiClient.get(`${EVENT_PREFIX}/my-events`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post(EVENT_PREFIX, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`${EVENT_PREFIX}/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`${EVENT_PREFIX}/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};
