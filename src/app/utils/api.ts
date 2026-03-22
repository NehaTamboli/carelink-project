import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6ca6d710`;

interface Message {
  id: string;
  message: string;
  sender: string;
  category: string;
  urgency: string;
  status: string;
  contact: string;
  amount: string | null;
  location: string;
  timestamp: string;
}

export const api = {
  // Get all messages
  async getMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error fetching messages:', data.error);
        return [];
      }
      
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Create a new message
  async createMessage(messageData: {
    message: string;
    sender?: string;
    category?: string;
    urgency?: string;
    status?: string;
    contact?: string;
    amount?: string | null;
    location?: string;
  }): Promise<Message | null> {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error creating message:', data.error);
        return null;
      }
      
      return data.message;
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  },

  // Update message
  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | null> {
    try {
      const response = await fetch(`${API_URL}/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error updating message:', data.error);
        return null;
      }
      
      return data.message;
    } catch (error) {
      console.error('Error updating message:', error);
      return null;
    }
  },

  // Delete message
  async deleteMessage(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  },

  // Analyze message with AI
  async analyzeMessage(message: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error analyzing message:', data.error);
        return null;
      }
      
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing message:', error);
      return null;
    }
  },
};
