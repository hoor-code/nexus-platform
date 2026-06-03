import axios from 'axios';

const API_URL = 'http://localhost:5000/api/meetings';

export const scheduleMeeting = async (meetingData: {
  title: string;
  description?: string;
  attendee: string; 
  startTime: string; 
  endTime: string;   
}) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(`${API_URL}/schedule`, meetingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to schedule meeting');
  }
};