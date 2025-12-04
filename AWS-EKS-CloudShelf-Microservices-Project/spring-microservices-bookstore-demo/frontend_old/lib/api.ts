// lib/api.ts - API client using relative URLs (proxied by Next.js)

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Use relative URLs - Next.js will proxy to API Gateway
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    console.log(`[API Call] ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ [API Error]', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Author API
export const authorApi = {
  getAllAuthors: () => apiClient.get<Author[]>('/api/authors'),
  createAuthor: (author: AuthorInput) => apiClient.post<Author>('/api/authors', author),
  deleteAuthor: (id: string) => apiClient.delete(`/api/authors/${id}`),
};

// Order API
export const orderApi = {
  placeOrder: (order: OrderInput) => apiClient.post<Order>('/api/order', order),
  getOrderById: (id: string) => apiClient.get<Order>(`/api/order/${id}`),
};

// Types
export interface Author {
  id: string;
  name: string;
  birthDate: string;
}

export interface AuthorInput {
  name: string;
  birthDate: string;
}

export interface Order {
  id: string;
  orderLineItemsDtoList: OrderLineItem[];
  totalAmount?: number;
  status?: string;
}

export interface OrderLineItem {
  skuCode: string;
  price: number;
  quantity: number;
}

export interface OrderInput {
  orderLineItemsDtoList: OrderLineItem[];
}