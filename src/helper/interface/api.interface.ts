export interface ApiResponse<T = any> {
    success: boolean;
    code?: number;
    msgCode?: string;
    message?: string;
    data?: T;
  }
