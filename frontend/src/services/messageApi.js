const BASE_URL = 'http://localhost:5000/api';

export const messageApi = {
  async getMessages(conversationId) {
    const response = await fetch(`${BASE_URL}/messages/${conversationId}`);
    return response.json();
  },

  async sendMessage(data) {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getMessageHistory(userId) {
    const response = await fetch(`${BASE_URL}/messages/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};
