import { useEffect, useState } from 'react';

// Base API URL from environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL!.replace(/\/$/, '');

// Define TypeScript interfaces for our API responses
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

// API client class for handling all API requests
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method to get auth headers
  private getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // User registration
  async register(email: string, password: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Registration failed');
        throw new Error(errorText || 'Registration failed');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Registration failed - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Registration failed - unexpected error format');
      }
    }

    const userData = await response.json();
    if (!userData.id) {
      throw new Error('Invalid response: missing user ID');
    }

    return userData;
  }

  // User login
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const formData = new URLSearchParams();
    formData.append('email', email);  // Backend expects 'email' field
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Login failed');
        throw new Error(errorText || 'Login failed');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Login failed - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Login failed - unexpected error format');
      }
    }

    const responseData = await response.json();
    if (!responseData.access_token) {
      throw new Error('Invalid response: missing access token');
    }

    return responseData;
  }

  // Get user's tasks
  async getTasks(userId: string, token: string): Promise<Task[]> {
    const response = await fetch(`/api/${userId}/tasks`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to fetch tasks');
        throw new Error(errorText || 'Failed to fetch tasks');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to fetch tasks - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to fetch tasks - unexpected error format');
      }
    }

    return response.json();
  }

  // Create a new task
  async createTask(userId: string, taskData: TaskCreate, token: string): Promise<Task> {
    const response = await fetch(`/api/${userId}/tasks`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to create task');
        throw new Error(errorText || 'Failed to create task');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to create task - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to create task - unexpected error format');
      }
    }

    return response.json();
  }

  // Update a task
  async updateTask(userId: string, taskId: string, taskData: TaskUpdate, token: string): Promise<Task> {
    const response = await fetch(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to update task');
        throw new Error(errorText || 'Failed to update task');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to update task - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to update task - unexpected error format');
      }
    }

    return response.json();
  }

  // Delete a task
  async deleteTask(userId: string, taskId: string, token: string): Promise<void> {
    const response = await fetch(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to delete task');
        throw new Error(errorText || 'Failed to delete task');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to delete task - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to delete task - unexpected error format');
      }
    }
  }

  // Mark task as complete/incomplete
  async updateTaskCompletion(userId: string, taskId: string, completed: boolean, token: string): Promise<Task> {
    const response = await fetch(`/api/${userId}/tasks/${taskId}/complete?completed=${completed}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to update task completion');
        throw new Error(errorText || 'Failed to update task completion');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to update task completion - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to update task completion - unexpected error format');
      }
    }

    return response.json();
  }

  // Get current user info
  async getMe(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/users/me`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use text or default message
        const errorText = await response.text().catch(() => 'Failed to fetch user info');
        throw new Error(errorText || 'Failed to fetch user info');
      }

      // Handle different possible error response formats
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object' && errorData !== null) {
        if (errorData.hasOwnProperty('detail') && typeof (errorData as any).detail === 'string') {
          throw new Error((errorData as any).detail as string);
        } else if (errorData.hasOwnProperty('message') && typeof (errorData as any).message === 'string') {
          throw new Error((errorData as any).message as string);
        } else if (errorData.hasOwnProperty('error') && typeof (errorData as any).error === 'string') {
          throw new Error((errorData as any).error as string);
        } else if (errorData.hasOwnProperty('errors') && Array.isArray((errorData as any).errors)) {
          // Handle validation errors array (common in 422 responses)
          const errors = (errorData as any).errors as Array<any>;
          const errorMessage = errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg && typeof err.msg === 'string') return err.msg;
            if (err.detail && typeof err.detail === 'string') return err.detail;
            if (err.message && typeof err.message === 'string') return err.message;
            if (typeof err === 'object' && err !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(err);
              for (const key of keys) {
                const value = err[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else if (Array.isArray(errorData)) {
          // Handle case where errorData is an array directly
          const errorMessage = errorData.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.msg && typeof item.msg === 'string') return item.msg;
            if (item.detail && typeof item.detail === 'string') return item.detail;
            if (item.message && typeof item.message === 'string') return item.message;
            if (typeof item === 'object' && item !== null) {
              // Try to extract any string value from the error object
              const keys = Object.keys(item);
              for (const key of keys) {
                const value = item[key];
                if (typeof value === 'string') return value;
              }
            }
            return 'Validation error occurred';
          }).join('; ');
          throw new Error(errorMessage || 'Validation error occurred');
        } else {
          // If none of the common fields exist or they're not strings, try to extract meaningful info
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            // Try to find any string value in the object to use as error message
            for (const key of keys) {
              const value = (errorData as any)[key];
              if (typeof value === 'string') {
                throw new Error(value);
              }
            }
          }
          // Try to extract field-specific errors (e.g., {"username": ["error"], "password": ["error"]})
          const fieldErrors = [];
          for (const [key, value] of Object.entries(errorData)) {
            if (Array.isArray(value)) {
              // Handle arrays of error messages for each field
              const fieldMessage = value.filter(msg => typeof msg === 'string').join('; ');
              if (fieldMessage) {
                fieldErrors.push(`${key}: ${fieldMessage}`);
              }
            } else if (typeof value === 'string') {
              fieldErrors.push(`${key}: ${value}`);
            }
          }

          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(' | '));
          }

          // If we still can't find a string value, create a more descriptive error
          // but avoid JSON.stringify to prevent [object Object] errors
          const errorSummary = keys.slice(0, 3).map(key => `${key}`).join(', ');
          throw new Error(`Failed to fetch user info - ${errorSummary ? `fields: ${errorSummary}` : 'validation error'}`);
        }
      } else {
        throw new Error('Failed to fetch user info - unexpected error format');
      }
    }

    return response.json();
  }
}

// Create and export a singleton instance of the API client
export const apiClient = new ApiClient();

// Export the interfaces for use in components
export type { User, Task, TaskCreate, TaskUpdate };