import { Card } from '@/components/ui/card';

interface TrendCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  label: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'green' | 'blue' | 'purple';
}

export function TrendCard({
  title,
  currentValue,
  previousValue,
  label,
  icon,
  color = 'indigo',
}: TrendCardProps) {
  const change = previousValue > 0
    ? Math.round(((currentValue - previousValue) / previousValue) * 100)
    : currentValue > 0 ? 100 : 0;

  const isPositive = change >= 0;

  const colorClasses = {
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      light: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-900',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      light: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-900',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      light: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-900',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      light: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-900',
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className={`p-6 ${colors.light} ${colors.border} border-2`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center shadow-md`}>
          <div className="text-white">{icon}</div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {isPositive ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colors.text}`}>{currentValue}</p>
        <p className="text-xs text-gray-500 mt-2">
          {previousValue} {label}
        </p>
      </div>
    </Card>
  );
}
