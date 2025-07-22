import { cn } from '@/lib/utils';
import { Home, ListTodo, Trophy, Package, Users } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'farm', label: 'Farm', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'leaderboard', label: 'Ranking', icon: Trophy },
  { id: 'inventory', label: 'Items', icon: Package },
  { id: 'referral', label: 'Friends', icon: Users },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-tonix-surface border-t border-border z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                isActive 
                  ? "text-tonix-primary bg-tonix-primary/10" 
                  : "text-muted-foreground hover:text-tonix-primary"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive ? "scale-110" : "scale-100"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}