import axios from 'axios';
import { Plan, PlanCreate, Day, Stats, TemplatePreview, ApplyTemplateResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 计划相关API
export const planAPI = {
  create: async (plan: PlanCreate): Promise<Plan> => {
    const response = await api.post('/plans/', plan);
    return response.data;
  },

  getByWeekStart: async (weekStart: string): Promise<Plan> => {
    const response = await api.get(`/plans/${weekStart}`);
    return response.data;
  },

  getCurrent: async (): Promise<Plan> => {
    const response = await api.get('/plans/current/');
    return response.data;
  },

  update: async (weekStart: string, plan: PlanCreate): Promise<Plan> => {
    const response = await api.put(`/plans/${weekStart}`, plan);
    return response.data;
  },
};

// 训练日相关API
export const dayAPI = {
  getByDate: async (date: string): Promise<Day> => {
    const response = await api.get(`/days/${date}`);
    return response.data;
  },

  updateCompleted: async (date: string, completed: boolean): Promise<Day> => {
    const response = await api.patch(`/days/${date}/completed`, null, {
      params: { completed },
    });
    return response.data;
  },
};

// 统计相关API
export const statsAPI = {
  getByWeekStart: async (weekStart: string): Promise<Stats> => {
    const response = await api.get(`/stats/${weekStart}`);
    return response.data;
  },

  getCurrent: async (): Promise<Stats> => {
    const response = await api.get('/stats/current/');
    return response.data;
  },
};

// 模板相关API
export const templateAPI = {
  getPreview: async (currentWeekStart: string): Promise<TemplatePreview> => {
    const response = await api.get(`/template/preview/${currentWeekStart}`);
    return response.data;
  },

  apply: async (template: TemplatePreview): Promise<ApplyTemplateResponse> => {
    const response = await api.post('/template/apply/', template);
    return response.data;
  },
};

// 健康检查
export const healthAPI = {
  check: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
