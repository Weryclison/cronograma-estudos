import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StudyStats } from '@/types/study';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';

interface StudyDashboardProps {
  stats: StudyStats;
}

export const StudyDashboard = ({ stats }: StudyDashboardProps) => {
  return (
    <div className="space-y-4">
      <Card className="card-subtle">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Resumo de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Planejado</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {stats.totalPlannedToday.toFixed(1)}h
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Concluído</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {stats.totalCompletedToday.toFixed(1)}h
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progresso do dia</span>
              <span className="text-sm font-medium text-card-foreground">
                {stats.completionPercentage}%
              </span>
            </div>
            <Progress 
              value={stats.completionPercentage} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-subtle">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Motivação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              {stats.consecutiveDays}
            </p>
            <p className="text-sm text-muted-foreground">
              dias consecutivos estudando
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};