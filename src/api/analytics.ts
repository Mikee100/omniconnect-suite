export const fetchWhatsAppAgentAIPerformance = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-agent-ai-performance`);
  return res.data;
};
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchWhatsAppSentimentAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-sentiment`);
  return res.data;
};

export const fetchTotalWhatsAppCustomers = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/total-whatsapp-customers`);
  return res.data;
};

export const fetchTotalInboundWhatsAppMessages = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/total-inbound-whatsapp-messages`);
  return res.data;
};

export const fetchTotalOutboundWhatsAppMessages = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/total-outbound-whatsapp-messages`);
  return res.data;
};

export const fetchPeakChatHours = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/peak-chat-hours`);
  return res.data;
};

export const fetchPeakChatDays = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/peak-chat-days`);
  return res.data;
};

export const fetchWhatsAppBookingConversionRate = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-booking-conversion-rate`);
  return res.data;
};

export const fetchWhatsAppSentimentTrend = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-sentiment-trend`);
  return res.data;
};

export const fetchWhatsAppSentimentByTopic = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-sentiment-by-topic`);
  return res.data;
};


export const fetchWhatsAppMostExtremeMessages = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-most-extreme-messages`);
  return res.data;
};

export const fetchWhatsAppKeywordTrends = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics/whatsapp-keyword-trends`);
  return res.data;
};
