interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = 'green' 
}) => {
  const colorClasses = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-primary/10 text-primary',
    amber: 'bg-accent/10 text-accent',
    purple: 'bg-primary/10 text-primary',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-accent/10 text-accent'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
