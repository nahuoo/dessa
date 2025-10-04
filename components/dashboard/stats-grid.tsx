import { Card } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'indigo' | 'green' | 'blue' | 'purple' | 'orange';
}

interface StatsGridProps {
  stats: StatItem[];
}

const colorClasses = {
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    light: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    light: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500 to-red-600',
    light: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-100',
  },
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color];

        return (
          <Card
            key={index}
            className={`p-6 ${colors.light} ${colors.border} border-2 hover:shadow-lg transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center shadow-md`}>
                <div className="text-white">{stat.icon}</div>
              </div>
              {stat.trend && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend.isPositive ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {Math.abs(stat.trend.value)}%
                </div>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${colors.text} mb-1`}>
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${colors.text.replace('700', '900')}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
