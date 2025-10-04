import { Card, CardContent } from '@/components/ui/card';

interface QuickStat {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'blue' | 'purple';
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-purple-50 border-indigo-100',
    green: 'from-green-50 to-emerald-50 border-green-100',
    blue: 'from-blue-50 to-cyan-50 border-blue-100',
    purple: 'from-purple-50 to-pink-50 border-purple-100',
  };

  const textColors = {
    indigo: 'text-indigo-900',
    green: 'text-green-900',
    blue: 'text-blue-900',
    purple: 'text-purple-900',
  };

  const iconBg = {
    indigo: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    green: 'bg-gradient-to-br from-green-500 to-emerald-600',
    blue: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${colorClasses[stat.color]} border-2`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg ${iconBg[stat.color]} flex items-center justify-center shadow-md flex-shrink-0`}
              >
                <div className="text-white">{stat.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${textColors[stat.color]} truncate`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
