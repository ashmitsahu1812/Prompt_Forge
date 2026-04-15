"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface MetricData {
  timestamp: string;
  value: number;
  label?: string;
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  status: 'healthy' | 'warning' | 'critical';
  data: MetricData[];
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function Monitoring() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const fetchMonitoringData = async () => {
    try {
      // Mock real-time data
      const now = new Date();
      const generateData = (baseValue: number, variance: number) => {
        return Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(now.getTime() - (19 - i) * 60000).toISOString(),
          value: baseValue + (Math.random() - 0.5) * variance
        }));
      };

      const mockMetrics: SystemMetric[] = [
        {
          id: 'response_time',
          name: 'Response Time',
          value: 245,
          unit: 'ms',
          change: -12,
          status: 'healthy',
          data: generateData(245, 50)
        },
        {
          id: 'throughput',
          name: 'Requests/Min',
          value: 1247,
          unit: 'req/min',
          change: 8,
          status: 'healthy',
          data: generateData(1247, 200)
        },
        {
          id: 'error_rate',
          name: 'Error Rate',
          value: 0.8,
          unit: '%',
          change: 0.2,
          status: 'warning',
          data: generateData(0.8, 0.5)
        },
        {
          id: 'cpu_usage',
          name: 'CPU Usage',
          value: 67,
          unit: '%',
          change: 5,
          status: 'healthy',
          data: generateData(67, 15)
        },
        {
          id: 'memory_usage',
          name: 'Memory Usage',
          value: 78,
          unit: '%',
          change: -3,
          status: 'healthy',
          data: generateData(78, 10)
        },
        {
          id: 'active_users',
          name: 'Active Users',
          value: 42,
          unit: 'users',
          change: 7,
          status: 'healthy',
          data: generateData(42, 8)
        }
      ];

      const mockAlerts: Alert[] = [
        {
          id: 'alert_001',
          type: 'warning',
          message: 'Error rate increased to 0.8% (threshold: 1%)',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_002',
          type: 'info',
          message: 'New deployment completed successfully',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          resolved: true
        },
        {
          id: 'alert_003',
          type: 'error',
          message: 'Database connection timeout (resolved)',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          resolved: true
        }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'info': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  const formatChange = (change: number, unit: string) => {
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'text-green-500' : 'text-red-500';
    return <span className={color}>{sign}{change}{unit === '%' ? '%' : ''}</span>;
  };

  if (loading) return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="h-96 skeleton rounded-2xl" />
        <div className="h-96 skeleton rounded-2xl" />
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-green-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Phase 3 • Live Data</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Real-time <span className="text-green-500 text-glow">Monitoring</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Monitor system performance, track metrics, and receive alerts in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 bg-neural-900 border border-white/10 rounded-xl text-sm font-bold text-foreground"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <button className="btn-premium">
            <span>Export Data</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {metrics.map(metric => (
          <div key={metric.id} className="card-premium group hover:border-green-500/30">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-foreground group-hover:text-green-500 transition-colors">
                  {metric.name}
                </h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-2 ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-foreground">
                  {metric.value.toLocaleString()}
                  <span className="text-lg text-neural-400 ml-1">{metric.unit}</span>
                </div>
                <div className="text-sm mt-1">
                  {formatChange(metric.change, metric.unit)} from last period
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-20 bg-neural-950/50 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {metric.data.slice(-10).map((point, index) => (
                  <div
                    key={index}
                    className="bg-green-500/30 rounded-t-sm transition-all hover:bg-green-500/50"
                    style={{
                      height: `${Math.max(10, (point.value / Math.max(...metric.data.map(d => d.value))) * 100)}%`,
                      width: '6px'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-neural-500">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <button className="text-green-500 hover:text-green-400 font-bold">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">System Alerts</h2>
            <p className="text-sm text-neural-400 font-medium italic">Recent notifications and warnings</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-foreground font-display">
              {alerts.filter(a => !a.resolved).length}
            </span>
            <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Active Alerts</div>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-6 rounded-2xl border transition-all ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getAlertColor(alert.type)}`}>
                        {alert.type}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-green-500 bg-green-500/10 border border-green-500/20">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-medium leading-relaxed">{alert.message}</p>
                    <p className="text-xs text-neural-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!alert.resolved && (
                  <button className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-bold text-sm hover:bg-green-500/20 transition-colors">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Performance Dashboard</h2>
            <p className="text-sm text-neural-400 font-medium italic">Detailed system metrics and trends</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Response Time Chart */}
          <div className="card-premium">
            <h3 className="text-xl font-black text-foreground mb-6">Response Time Trend</h3>
            <div className="h-64 bg-neural-950/50 rounded-xl p-6 relative">
              <div className="absolute inset-6 flex items-end justify-between">
                {metrics[0]?.data.map((point, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/30 rounded-t-sm transition-all hover:bg-blue-500/50"
                    style={{
                      height: `${Math.max(10, (point.value / Math.max(...metrics[0].data.map(d => d.value))) * 100)}%`,
                      width: '8px'
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-6 left-6 text-sm text-neural-400">
                Response Time (ms)
              </div>
            </div>
          </div>

          {/* Throughput Chart */}
          <div className="card-premium">
            <h3 className="text-xl font-black text-foreground mb-6">Request Throughput</h3>
            <div className="h-64 bg-neural-950/50 rounded-xl p-6 relative">
              <div className="absolute inset-6 flex items-end justify-between">
                {metrics[1]?.data.map((point, index) => (
                  <div
                    key={index}
                    className="bg-green-500/30 rounded-t-sm transition-all hover:bg-green-500/50"
                    style={{
                      height: `${Math.max(10, (point.value / Math.max(...metrics[1].data.map(d => d.value))) * 100)}%`,
                      width: '8px'
                    }}
                  />
                ))}
              </div>
              <div className="absolute top-6 left-6 text-sm text-neural-400">
                Requests per Minute
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}