import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStudyData } from '@/hooks/useStudyData';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';

const Stats = () => {
  const { sessions, goals } = useStudyData();

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek;
    });

    const totalHours = weekSessions.reduce((sum, session) => 
      sum + (session.hoursStudied || 0), 0
    );
    
    const completedHours = weekSessions
      .filter(session => session.status === 'completed')
      .reduce((sum, session) => sum + (session.hoursStudied || 0), 0);

    return { totalHours, completedHours, sessionsCount: weekSessions.length };
  };

  // Calculate subject distribution
  const getSubjectStats = () => {
    const subjectHours = sessions.reduce((acc, session) => {
      if (session.status === 'completed') {
        acc[session.subject] = (acc[session.subject] || 0) + (session.hoursStudied || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(subjectHours)
      .map(([subject, hours]) => ({ subject, hours }))
      .sort((a, b) => b.hours - a.hours);
  };

  const weeklyStats = getWeeklyStats();
  const subjectStats = getSubjectStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weekly Overview */}
            <Card className="card-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Horas totais</span>
                    <span className="font-medium">{weeklyStats.totalHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concluídas</span>
                    <span className="font-medium text-success">{weeklyStats.completedHours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessões</span>
                    <span className="font-medium">{weeklyStats.sessionsCount}</span>
                  </div>
                </div>
                <Progress 
                  value={weeklyStats.totalHours > 0 ? (weeklyStats.completedHours / weeklyStats.totalHours) * 100 : 0}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Total Stats */}
            <Card className="card-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Total Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                    {sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.hoursStudied || 0), 0).toFixed(1)}h
                  </div>
                  <p className="text-sm text-muted-foreground">horas estudadas</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-card-foreground">
                    {sessions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">sessões criadas</p>
                </div>
              </CardContent>
            </Card>

            {/* Productivity */}
            <Card className="card-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  Produtividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">taxa de conclusão</p>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <div className="text-sm font-medium text-success">
                      {sessions.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-muted-foreground">✅</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-warning">
                      {sessions.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="text-muted-foreground">⏳</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-destructive">
                      {sessions.filter(s => s.status === 'not-done').length}
                    </div>
                    <div className="text-muted-foreground">❌</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Distribution */}
          <Card className="card-subtle">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Distribuição por Matéria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjectStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sessão concluída ainda</p>
                  <p className="text-sm mt-1">Complete algumas sessões para ver as estatísticas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subjectStats.map(({ subject, hours }) => {
                    const maxHours = Math.max(...subjectStats.map(s => s.hours));
                    const percentage = maxHours > 0 ? (hours / maxHours) * 100 : 0;
                    
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-card-foreground">{subject}</span>
                          <span className="text-muted-foreground">{hours.toFixed(1)}h</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;