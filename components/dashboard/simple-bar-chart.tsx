interface DataPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  title: string;
  color?: 'indigo' | 'green' | 'blue' | 'purple';
}

export function SimpleBarChart({ data, title, color = 'indigo' }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const colorClasses = {
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((point, index) => {
          const percentage = (point.value / maxValue) * 100;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{point.label}</span>
                <span className="text-sm font-semibold text-gray-900">{point.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay datos disponibles
        </div>
      )}
    </div>
  );
}
