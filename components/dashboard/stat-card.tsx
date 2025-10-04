'use client';

import { Card } from '@/components/ui/card';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: 'users' | 'calendar' | 'clock' | 'trending-up';
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  insight?: string;
}

const iconMap = {
  users: Users,
  calendar: Calendar,
  clock: Clock,
  'trending-up': TrendingUp,
};

export function StatCard({ title, value, subtitle, iconName, trend, insight }: StatCardProps) {
  const Icon = iconMap[iconName];
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-md">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          </div>

          <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-500 font-medium">{subtitle}</p>
          )}

          {trend && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <svg
                  className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span className="text-sm font-bold">
                  {Math.abs(trend.value)}%
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{trend.label}</span>
            </div>
          )}
        </div>
      </div>

      {insight && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100/50 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-indigo-900 leading-relaxed flex-1">{insight}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
