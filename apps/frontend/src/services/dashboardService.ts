/**
 * Dashboard service for fetching real-time data
 */

import { apiClient } from '@/lib/api';

export interface DashboardKPIs {
  total_clients: number;
  monthly_revenue: number;
  scheduled_services: number;
  inventory_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  pending_orders: number;
  active_staff: number;
  completion_rate: number;
  todays_jobs: number;
}

export interface RevenueTrend {
  name: string;
  value: number;
  date: string;
}

export interface ServiceDistribution {
  name: string;
  value: number;
  percentage: number;
}

export interface TeamProductivity {
  name: string;
  value: number;
  efficiency: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  client: string;
  time: string;
  type: 'client' | 'service' | 'payment' | 'maintenance';
  status?: string;
}

export interface StockAlert {
  product_id: number;
  product_name: string;
  product_sku: string;
  current_stock: number;
  min_stock_level: number;
  alert_type: 'low_stock' | 'out_of_stock';
  days_until_stockout: number;
  suggested_order_quantity: number;
}

class DashboardService {
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Get inventory summary
      const inventoryResponse = await apiClient.get('/inventory/dashboard/summary/');
      const inventoryData = inventoryResponse.data;

      // Mock data for other KPIs (these would come from other services)
      const mockKPIs: DashboardKPIs = {
        total_clients: 247,
        monthly_revenue: 24500,
        scheduled_services: 89,
        inventory_items: inventoryData.total_products || 156,
        low_stock_items: inventoryData.low_stock_products || 3,
        out_of_stock_items: inventoryData.out_of_stock_products || 1,
        pending_orders: inventoryData.pending_orders || 5,
        active_staff: 28,
        completion_rate: 94,
        todays_jobs: 12,
      };

      return mockKPIs;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Return default values on error
      return {
        total_clients: 0,
        monthly_revenue: 0,
        scheduled_services: 0,
        inventory_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        pending_orders: 0,
        active_staff: 0,
        completion_rate: 0,
        todays_jobs: 0,
      };
    }
  }

  async getRevenueTrend(): Promise<RevenueTrend[]> {
    try {
      // Mock data - in real implementation, this would come from finance API
      const mockData: RevenueTrend[] = [
        { name: "Jan", value: 4000, date: "2024-01-01" },
        { name: "Feb", value: 3000, date: "2024-02-01" },
        { name: "Mar", value: 5000, date: "2024-03-01" },
        { name: "Apr", value: 4500, date: "2024-04-01" },
        { name: "May", value: 6000, date: "2024-05-01" },
        { name: "Jun", value: 5500, date: "2024-06-01" },
      ];
      return mockData;
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      return [];
    }
  }

  async getServiceDistribution(): Promise<ServiceDistribution[]> {
    try {
      // Mock data - in real implementation, this would come from services API
      const mockData: ServiceDistribution[] = [
        { name: "Deep Cleaning", value: 35, percentage: 35 },
        { name: "Regular Cleaning", value: 45, percentage: 45 },
        { name: "Carpet Cleaning", value: 15, percentage: 15 },
        { name: "Window Cleaning", value: 5, percentage: 5 },
      ];
      return mockData;
    } catch (error) {
      console.error('Error fetching service distribution:', error);
      return [];
    }
  }

  async getTeamProductivity(): Promise<TeamProductivity[]> {
    try {
      // Mock data - in real implementation, this would come from HR API
      const mockData: TeamProductivity[] = [
        { name: "Team A", value: 92, efficiency: 92 },
        { name: "Team B", value: 87, efficiency: 87 },
        { name: "Team C", value: 94, efficiency: 94 },
        { name: "Team D", value: 89, efficiency: 89 },
      ];
      return mockData;
    } catch (error) {
      console.error('Error fetching team productivity:', error);
      return [];
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      // Mock data - in real implementation, this would come from activity API
      const mockData: RecentActivity[] = [
        {
          id: 1,
          action: "New client registration",
          client: "ABC Corp",
          time: "2 hours ago",
          type: "client",
          status: "completed"
        },
        {
          id: 2,
          action: "Service completed",
          client: "XYZ Office",
          time: "4 hours ago",
          type: "service",
          status: "completed"
        },
        {
          id: 3,
          action: "Invoice paid",
          client: "123 Restaurant",
          time: "6 hours ago",
          type: "payment",
          status: "completed"
        },
        {
          id: 4,
          action: "Equipment maintenance",
          client: "Vacuum Cleaner #12",
          time: "1 day ago",
          type: "maintenance",
          status: "scheduled"
        },
      ];
      return mockData;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    try {
      const response = await apiClient.get('/inventory/dashboard/stock_alerts/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      return [];
    }
  }

  async getInventorySummary() {
    try {
      const response = await apiClient.get('/inventory/dashboard/summary/');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();
