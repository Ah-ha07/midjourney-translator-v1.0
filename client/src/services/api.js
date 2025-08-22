import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('响应错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 翻译相关API
export const translateAPI = {
  // 单条翻译
  translate: (data) => api.post('/translate', data),
  
  // 批量翻译
  translateBatch: (data) => api.post('/translate/batch', data),
  
  // 词组分析
  analyzePhrases: (data) => api.post('/translate/analyze-phrases', data),
  
  // 交互式翻译（一步完成）
  translateInteractive: (data) => api.post('/translate/interactive', data),
  
  // 获取翻译历史
  getHistory: (params) => api.get('/translate/history', { params }),
  
  // 删除翻译记录
  deleteTranslation: (id) => api.delete(`/translate/${id}`)
};

// 提示词相关API
export const promptsAPI = {
  // 获取所有提示词
  getPrompts: (params) => api.get('/prompts', { params }),
  
  // 获取单个提示词
  getPrompt: (id) => api.get(`/prompts/${id}`),
  
  // 创建提示词
  createPrompt: (data) => api.post('/prompts', data),
  
  // 更新提示词
  updatePrompt: (id, data) => api.put(`/prompts/${id}`, data),
  
  // 删除提示词
  deletePrompt: (id) => api.delete(`/prompts/${id}`)
};

// 图片相关API
export const imagesAPI = {
  // 上传图片
  uploadImage: (formData) => api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 获取图片列表
  getImages: (params) => api.get('/images', { params }),
  
  // 删除图片
  deleteImage: (id) => api.delete(`/images/${id}`)
};

// 健康检查
export const healthAPI = {
  check: () => api.get('/health')
};

export default api;
