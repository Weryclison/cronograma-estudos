import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  BarChart3, 
  Target, 
  Calendar, 
  BookOpen 
} from 'lucide-react';

export const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/stats', icon: BarChart3, label: 'Estatísticas' },
    { path: '/goals', icon: Target, label: 'Metas' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
  ];

  return (
    <Card className="card-subtle mb-6">
      <nav className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            Cronograma de Estudos
          </h1>
        </div>
        
        <ul className="flex gap-2 overflow-x-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
};