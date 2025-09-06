import { useState } from 'react';
import { Plus, Target, Edit, Trash2 } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudyData } from '@/hooks/useStudyData';
import { StudyGoal } from '@/types/study';

const Goals = () => {
  const { goals, sessions, addGoal, updateGoal, deleteGoal } = useStudyData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    weeklyHours: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.weeklyHours) return;

    const goalData = {
      subject: formData.subject,
      weeklyHours: parseFloat(formData.weeklyHours),
      week: getWeekString(),
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    setIsFormOpen(false);
    setEditingGoal(null);
    setFormData({ subject: '', weeklyHours: '' });
  };

  const getWeekString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const weekNumber = Math.ceil((today.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-${String(weekNumber).padStart(2, '0')}`;
  };

  const getGoalProgress = (goal: StudyGoal) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && 
             session.subject === goal.subject && 
             session.status === 'completed';
    });

    const currentHours = weekSessions.reduce((sum, session) => 
      sum + (session.hoursStudied || 0), 0
    );

    return {
      currentHours,
      percentage: Math.min((currentHours / goal.weeklyHours) * 100, 100),
      isCompleted: currentHours >= goal.weeklyHours,
    };
  };

  const handleEdit = (goal: StudyGoal) => {
    setEditingGoal(goal);
    setFormData({
      subject: goal.subject,
      weeklyHours: goal.weeklyHours.toString(),
    });
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Navigation />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-card-foreground">Metas de Estudo</h1>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </div>

          {goals.length === 0 ? (
            <Card className="card-subtle">
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Nenhuma meta definida
                </h3>
                <p className="text-muted-foreground mb-6">
                  Defina metas semanais para cada matéria e acompanhe seu progresso
                </p>
                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeira meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => {
                const progress = getGoalProgress(goal);
                
                return (
                  <Card key={goal.id} className="card-subtle">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-card-foreground">
                          {goal.subject}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta semanal</span>
                        <span className="font-medium">{goal.weeklyHours}h</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso desta semana</span>
                          <span className={`font-medium ${progress.isCompleted ? 'text-success' : 'text-card-foreground'}`}>
                            {progress.currentHours.toFixed(1)}h / {goal.weeklyHours}h
                          </span>
                        </div>
                        <Progress 
                          value={progress.percentage} 
                          className="h-3"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {progress.percentage.toFixed(0)}% concluído
                          </span>
                          {progress.isCompleted && (
                            <span className="text-success font-medium">
                              ✅ Meta atingida!
                            </span>
                          )}
                        </div>
                      </div>

                      {!progress.isCompleted && (
                        <div className="text-xs text-muted-foreground">
                          Faltam {(goal.weeklyHours - progress.currentHours).toFixed(1)}h para atingir a meta
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Goal Form Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta de Estudo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Matéria</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ex: Matemática, História..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyHours">Horas por semana</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: e.target.value }))}
                  placeholder="Ex: 5"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingGoal(null);
                    setFormData({ subject: '', weeklyHours: '' });
                  }} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Atualizar' : 'Criar Meta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Goals;