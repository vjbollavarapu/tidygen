/**
 * Integration test utilities for backend API connectivity
 * Run these tests to verify the backend integration is working correctly
 */

import apiClient from '@/services/api';
import { toast } from '@/components/ui/enhanced-notifications';

export interface IntegrationTestResult {
  test: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

export class IntegrationTester {
  private results: IntegrationTestResult[] = [];

  async runAllTests(): Promise<IntegrationTestResult[]> {
    console.log('🚀 Starting Backend Integration Tests...');
    
    await this.testHealthCheck();
    await this.testAuthentication();
    await this.testInventoryEndpoints();
    await this.testFinanceEndpoints();
    await this.testErrorHandling();
    
    this.printResults();
    return this.results;
  }

  private async testHealthCheck(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await apiClient.get('/health/');
      const duration = Date.now() - startTime;
      
      this.addResult({
        test: 'Health Check',
        status: 'pass',
        message: `Backend is healthy (${duration}ms)`,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Health Check',
        status: 'fail',
        message: `Backend health check failed: ${error.message}`,
        duration,
      });
    }
  }

  private async testAuthentication(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test login endpoint (this will fail with invalid credentials, but should not be a network error)
      await apiClient.post('/auth/login/', {
        email: 'test@example.com',
        password: 'invalidpassword',
      });
      
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Authentication Endpoint',
        status: 'pass',
        message: 'Authentication endpoint is accessible',
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // If we get a 401, that's expected for invalid credentials
      if (error.status === 401) {
        this.addResult({
          test: 'Authentication Endpoint',
          status: 'pass',
          message: 'Authentication endpoint is accessible (401 as expected)',
          duration,
        });
      } else {
        this.addResult({
          test: 'Authentication Endpoint',
          status: 'fail',
          message: `Authentication endpoint failed: ${error.message}`,
          duration,
        });
      }
    }
  }

  private async testInventoryEndpoints(): Promise<void> {
    const endpoints = [
      { name: 'Products', path: '/inventory/products/' },
      { name: 'Categories', path: '/inventory/categories/' },
      { name: 'Suppliers', path: '/inventory/suppliers/' },
      { name: 'Purchase Orders', path: '/inventory/purchase-orders/' },
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.name, endpoint.path);
    }
  }

  private async testFinanceEndpoints(): Promise<void> {
    const endpoints = [
      { name: 'Invoices', path: '/finance/invoices/' },
      { name: 'Customers', path: '/finance/customers/' },
      { name: 'Payments', path: '/finance/payments/' },
      { name: 'Expenses', path: '/finance/expenses/' },
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint.name, endpoint.path);
    }
  }

  private async testEndpoint(name: string, path: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await apiClient.get(path);
      const duration = Date.now() - startTime;
      
      this.addResult({
        test: `${name} Endpoint`,
        status: 'pass',
        message: `Endpoint accessible (${response.status})`,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // 401/403 are expected for unauthenticated requests
      if (error.status === 401 || error.status === 403) {
        this.addResult({
          test: `${name} Endpoint`,
          status: 'pass',
          message: `Endpoint accessible (${error.status} as expected for unauthenticated)`,
          duration,
        });
      } else {
        this.addResult({
          test: `${name} Endpoint`,
          status: 'fail',
          message: `Endpoint failed: ${error.message}`,
          duration,
        });
      }
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test a non-existent endpoint
      await apiClient.get('/non-existent-endpoint/');
      
      const duration = Date.now() - startTime;
      this.addResult({
        test: 'Error Handling',
        status: 'fail',
        message: 'Expected 404 error but got success',
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404) {
        this.addResult({
          test: 'Error Handling',
          status: 'pass',
          message: 'Error handling works correctly (404 as expected)',
          duration,
        });
      } else {
        this.addResult({
          test: 'Error Handling',
          status: 'fail',
          message: `Unexpected error status: ${error.status}`,
          duration,
        });
      }
    }
  }

  private addResult(result: IntegrationTestResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    console.log('\n📊 Integration Test Results:');
    console.log('================================');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}: ${result.message}${duration}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Backend integration is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check your backend configuration.');
    }
  }
}

// Utility function to run tests from browser console
export async function runIntegrationTests(): Promise<IntegrationTestResult[]> {
  const tester = new IntegrationTester();
  return await tester.runAllTests();
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runIntegrationTests = runIntegrationTests;
}

export default IntegrationTester;
