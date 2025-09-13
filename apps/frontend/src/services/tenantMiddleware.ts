/**
 * Tenant middleware for API calls
 * Automatically adds tenant headers to all API requests
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTenantHeaders } from '@/contexts/TenantContext';

// Tenant-aware API client wrapper
export class TenantAwareApiClient {
  private baseApiClient: any;
  
  constructor(baseApiClient: any) {
    this.baseApiClient = baseApiClient;
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor to add tenant headers
    this.baseApiClient.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const tenantHeaders = getTenantHeaders();
        
        // Add tenant headers to all requests
        config.headers = {
          ...config.headers,
          ...tenantHeaders,
        };
        
        // Add tenant context to request metadata
        config.metadata = {
          ...config.metadata,
          tenantId: tenantHeaders['X-Tenant-ID'],
          timestamp: new Date().toISOString(),
        };
        
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for tenant-specific error handling
    this.baseApiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log tenant-specific API calls for usage tracking
        this.logApiUsage(response);
        return response;
      },
      (error: any) => {
        // Handle tenant-specific errors
        this.handleTenantError(error);
        return Promise.reject(error);
      }
    );
  }
  
  private logApiUsage(response: AxiosResponse) {
    const tenantId = response.config.metadata?.tenantId;
    if (tenantId) {
      // Send usage data to backend for tracking
      this.trackApiUsage(tenantId, {
        endpoint: response.config.url,
        method: response.config.method,
        status: response.status,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  private handleTenantError(error: any) {
    const status = error.response?.status;
    const tenantId = error.config?.metadata?.tenantId;
    
    switch (status) {
      case 403:
        if (error.response?.data?.code === 'TENANT_SUSPENDED') {
          // Handle suspended tenant
          this.handleSuspendedTenant(tenantId);
        } else if (error.response?.data?.code === 'TENANT_LIMIT_EXCEEDED') {
          // Handle usage limit exceeded
          this.handleLimitExceeded(tenantId, error.response.data);
        }
        break;
      case 404:
        if (error.response?.data?.code === 'TENANT_NOT_FOUND') {
          // Handle tenant not found
          this.handleTenantNotFound(tenantId);
        }
        break;
    }
  }
  
  private async trackApiUsage(tenantId: string, usage: any) {
    try {
      // This would typically send to a usage tracking endpoint
      await this.baseApiClient.post('/tenants/usage/track/', {
        tenant_id: tenantId,
        ...usage,
      });
    } catch (error) {
      // Silently fail usage tracking to not break main functionality
      console.warn('Failed to track API usage:', error);
    }
  }
  
  private handleSuspendedTenant(tenantId: string) {
    // Redirect to tenant suspension page
    window.location.href = `/tenant-suspended?tenant=${tenantId}`;
  }
  
  private handleLimitExceeded(tenantId: string, data: any) {
    // Show upgrade prompt or limit exceeded message
    const event = new CustomEvent('tenant-limit-exceeded', {
      detail: { tenantId, limit: data.limit, current: data.current }
    });
    window.dispatchEvent(event);
  }
  
  private handleTenantNotFound(tenantId: string) {
    // Redirect to tenant selection or create new tenant
    window.location.href = `/tenant-not-found?tenant=${tenantId}`;
  }
  
  // Proxy all methods to the base API client
  get(url: string, config?: AxiosRequestConfig) {
    return this.baseApiClient.get(url, config);
  }
  
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.baseApiClient.post(url, data, config);
  }
  
  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.baseApiClient.put(url, data, config);
  }
  
  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.baseApiClient.patch(url, data, config);
  }
  
  delete(url: string, config?: AxiosRequestConfig) {
    return this.baseApiClient.delete(url, config);
  }
}

// Tenant-aware data isolation utilities
export class TenantDataIsolation {
  /**
   * Filter data by tenant ID
   */
  static filterByTenant<T extends { tenant_id?: string }>(
    data: T[],
    tenantId: string
  ): T[] {
    return data.filter(item => item.tenant_id === tenantId);
  }
  
  /**
   * Add tenant ID to data before sending to API
   */
  static addTenantId<T extends Record<string, any>>(
    data: T,
    tenantId: string
  ): T & { tenant_id: string } {
    return {
      ...data,
      tenant_id: tenantId,
    };
  }
  
  /**
   * Validate tenant access to resource
   */
  static validateTenantAccess(
    resourceTenantId: string,
    currentTenantId: string
  ): boolean {
    return resourceTenantId === currentTenantId;
  }
  
  /**
   * Create tenant-scoped query parameters
   */
  static createTenantQuery(tenantId: string, additionalParams: Record<string, any> = {}) {
    return {
      tenant_id: tenantId,
      ...additionalParams,
    };
  }
}

// Tenant usage tracking
export class TenantUsageTracker {
  private static instance: TenantUsageTracker;
  private usageCache: Map<string, any> = new Map();
  
  static getInstance(): TenantUsageTracker {
    if (!TenantUsageTracker.instance) {
      TenantUsageTracker.instance = new TenantUsageTracker();
    }
    return TenantUsageTracker.instance;
  }
  
  trackApiCall(tenantId: string, endpoint: string, method: string) {
    const key = `${tenantId}-api-calls`;
    const current = this.usageCache.get(key) || 0;
    this.usageCache.set(key, current + 1);
    
    // Send to backend periodically
    this.debouncedSync(tenantId, 'api_calls', this.usageCache.get(key));
  }
  
  trackStorageUsage(tenantId: string, bytes: number) {
    const key = `${tenantId}-storage`;
    const current = this.usageCache.get(key) || 0;
    this.usageCache.set(key, current + bytes);
    
    this.debouncedSync(tenantId, 'storage', this.usageCache.get(key));
  }
  
  trackUserAction(tenantId: string, action: string) {
    const key = `${tenantId}-actions`;
    const current = this.usageCache.get(key) || [];
    current.push({ action, timestamp: new Date().toISOString() });
    this.usageCache.set(key, current);
    
    this.debouncedSync(tenantId, 'actions', current);
  }
  
  private debouncedSync = this.debounce((tenantId: string, type: string, value: any) => {
    this.syncUsage(tenantId, type, value);
  }, 5000);
  
  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  private async syncUsage(tenantId: string, type: string, value: any) {
    try {
      // This would sync with the backend
      console.log(`Syncing ${type} usage for tenant ${tenantId}:`, value);
    } catch (error) {
      console.warn('Failed to sync usage:', error);
    }
  }
  
  getUsage(tenantId: string, type: string) {
    const key = `${tenantId}-${type}`;
    return this.usageCache.get(key);
  }
  
  clearUsage(tenantId: string) {
    const keys = Array.from(this.usageCache.keys()).filter(key => 
      key.startsWith(`${tenantId}-`)
    );
    keys.forEach(key => this.usageCache.delete(key));
  }
}

// Export singleton instance
export const tenantUsageTracker = TenantUsageTracker.getInstance();

export default TenantAwareApiClient;
