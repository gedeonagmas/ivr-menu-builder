import { DiagramModel } from '@workflow-builder/types/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getAuthToken();
    const isGuest = localStorage.getItem('guest_mode') === 'true';
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(isGuest && { 'X-Guest-Mode': 'true' }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name?: string, organizationName?: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, organizationName }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  // Workflows
  async getWorkflows() {
    return this.request<{ workflows: any[] }>('/workflows');
  }

  async getWorkflow(id: string) {
    return this.request<{ workflow: any }>(`/workflows/${id}`);
  }

  async createWorkflow(name: string, description: string, diagram: DiagramModel['diagram']) {
    return this.request<{ workflow: any }>('/workflows', {
      method: 'POST',
      body: JSON.stringify({ name, description, diagram }),
    });
  }

  async updateWorkflow(id: string, updates: { name?: string; description?: string; diagram?: DiagramModel['diagram'] }) {
    return this.request<{ workflow: any }>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deployWorkflow(id: string) {
    return this.request<{ workflow: any; twilioFlowSid: string }>(`/workflows/${id}/deploy`, {
      method: 'POST',
    });
  }

  async deleteWorkflow(id: string) {
    return this.request<{ message: string }>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Calls
  async getCalls(params?: { page?: number; limit?: number; workflowId?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.workflowId) queryParams.append('workflowId', params.workflowId);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return this.request<{ calls: any[]; pagination: any }>(`/calls${query ? `?${query}` : ''}`);
  }

  async getCall(id: string) {
    return this.request<{ call: any }>(`/calls/${id}`);
  }

  async makeCall(to: string, workflowId: string) {
    return this.request<{ call: any }>('/calls', {
      method: 'POST',
      body: JSON.stringify({ to, workflowId }),
    });
  }

  // Phone Numbers
  async getPhoneNumbers() {
    return this.request<{ phoneNumbers: any[] }>('/phone-numbers');
  }

  async purchasePhoneNumber(areaCode: string) {
    return this.request<{ phoneNumber: any }>('/phone-numbers/purchase', {
      method: 'POST',
      body: JSON.stringify({ areaCode }),
    });
  }

  // Recordings
  async getRecordings(params?: { page?: number; limit?: number; callId?: string; workflowId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.callId) queryParams.append('callId', params.callId);
    if (params?.workflowId) queryParams.append('workflowId', params.workflowId);
    
    const query = queryParams.toString();
    return this.request<{ recordings: any[]; pagination: any }>(`/recordings${query ? `?${query}` : ''}`);
  }

  // Analytics
  async getAnalytics(params?: { startDate?: string; endDate?: string; workflowId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.workflowId) queryParams.append('workflowId', params.workflowId);
    
    const query = queryParams.toString();
    return this.request<{ summary: any; callsByStatus: any[]; callsByWorkflow: any[]; recentCalls: any[] }>(`/analytics/dashboard${query ? `?${query}` : ''}`);
  }

  async getCallVolume(params?: { startDate?: string; endDate?: string; groupBy?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
    
    const query = queryParams.toString();
    return this.request<{ volume: any[] }>(`/analytics/volume${query ? `?${query}` : ''}`);
  }
}

export const apiService = new ApiService();

