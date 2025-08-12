import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  const getChangeSymbol = () => {
    switch (changeType) {
      case 'positive':
        return '+';
      case 'negative':
        return '-';
      default:
        return '';
    }
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-medium group cursor-pointer ${
      gradient 
        ? 'bg-gradient-primary text-white border-transparent shadow-soft' 
        : 'bg-card border-border hover:border-primary/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${gradient ? 'text-white' : 'text-foreground'}`}>
            {value}
          </p>
          <div className="flex items-center mt-4">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              gradient 
                ? 'text-white bg-white/20' 
                : getChangeColor()
            }`}>
              {getChangeSymbol()}{change}
            </span>
            <span className={`text-xs mr-2 ${gradient ? 'text-white/60' : 'text-muted-foreground'}`}>
              من الشهر الماضي
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg transition-all duration-300 group-hover:scale-110 ${
          gradient 
            ? 'bg-white/20' 
            : 'bg-primary/10 group-hover:bg-primary/20'
        }`}>
          <Icon className={`w-8 h-8 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;