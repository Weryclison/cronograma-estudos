import { useState, useEffect } from 'react';
import { StudySession, StudyGoal, StudyStats } from '@/types/study';
import { toast } from '@/hooks/use-toast';
import { formatDateForDisplay } from '@/lib/utils';

const STORAGE_KEYS = {
  SESSIONS: 'study-sessions',
  GOALS: 'study-goals',
};

export const useStudyData = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions, loading]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals, loading]);

  const addSession = (session: Omit<StudySession, 'id' | 'hoursStudied'>) => {
    const [year, month, day] = session.date.split('-').map(Number);
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const [endHour, endMinute] = session.endTime.split(':').map(Number);

    // Create Date objects in local time to avoid timezone issues
    const startTime = new Date(year, month - 1, day, startHour, startMinute);
    const endTime = new Date(year, month - 1, day, endHour, endMinute);
    const hoursStudied = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      hoursStudied: Math.max(0, hoursStudied),
    };

    setSessions(prev => [...prev, newSession]);
    toast({
      title: "Sessão adicionada",
      description: `${session.subject} agendado para ${formatDateForDisplay(session.date)}`,
    });
  };

  const updateSession = (id: string, updates: Partial<StudySession>) => {
    setSessions(prev => prev.map(session => {
      if (session.id === id) {
        const updated = { ...session, ...updates };
        
        // Recalculate hours if time changes
        if (updates.startTime || updates.endTime || updates.date) {
          const [year, month, day] = updated.date.split('-').map(Number);
          const [startHour, startMinute] = updated.startTime.split(':').map(Number);
          const [endHour, endMinute] = updated.endTime.split(':').map(Number);

          // Create Date objects in local time to avoid timezone issues
          const startTime = new Date(year, month - 1, day, startHour, startMinute);
          const endTime = new Date(year, month - 1, day, endHour, endMinute);
          const hoursStudied = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          updated.hoursStudied = Math.max(0, hoursStudied);
        }
        
        return updated;
      }
      return session;
    }));
    
    toast({
      title: "Sessão atualizada",
      description: "As informações foram salvas com sucesso",
    });
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
    toast({
      title: "Sessão removida",
      description: "A sessão foi excluída com sucesso",
    });
  };

  const addGoal = (goal: Omit<StudyGoal, 'id' | 'currentHours'>) => {
    const newGoal: StudyGoal = {
      ...goal,
      id: Date.now().toString(),
      currentHours: 0,
    };

    setGoals(prev => [...prev, newGoal]);
    toast({
      title: "Meta adicionada",
      description: `Meta de ${goal.weeklyHours}h para ${goal.subject}`,
    });
  };

  const updateGoal = (id: string, updates: Partial<StudyGoal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast({
      title: "Meta removida",
      description: "A meta foi excluída com sucesso",
    });
  };

  const getWeekSessions = (weekOffset = 0) => {
    const today = new Date();
    const currentWeek = new Date(today);
    currentWeek.setDate(today.getDate() + (weekOffset * 7));
    
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Normalize to end of day



    return sessions.filter(session => {
      const [sYear, sMonth, sDay] = session.date.split('-').map(Number);
      const sessionDateLocal = new Date(sYear, sMonth - 1, sDay);
      sessionDateLocal.setHours(0, 0, 0, 0); // Normalize to start of day
      return sessionDateLocal >= startOfWeek && sessionDateLocal <= endOfWeek;
    });
  };

  const getTodayStats = (): StudyStats => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(session => session.date === today);
    
    const totalPlannedToday = todaySessions.reduce((sum, session) => 
      sum + (session.hoursStudied || 0), 0
    );
    
    const totalCompletedToday = todaySessions
      .filter(session => session.status === 'completed')
      .reduce((sum, session) => sum + (session.hoursStudied || 0), 0);
    
    const completionPercentage = totalPlannedToday > 0 
      ? Math.round((totalCompletedToday / totalPlannedToday) * 100)
      : 0;

    return {
      totalPlannedToday,
      totalCompletedToday,
      completionPercentage,
      consecutiveDays: 0, // TODO: Calculate consecutive days
    };
  };

  return {
    sessions,
    goals,
    loading,
    addSession,
    updateSession,
    deleteSession,
    addGoal,
    updateGoal,
    deleteGoal,
    getWeekSessions,
    getTodayStats,
  };
};