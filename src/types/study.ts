export interface StudySession {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  date: string;
  notes?: string;
  status: 'completed' | 'pending' | 'not-done';
  hoursStudied?: number;
}

export interface StudyGoal {
  id: string;
  subject: string;
  weeklyHours: number;
  currentHours: number;
  week: string; // YYYY-WW format
}

export interface StudyStats {
  totalPlannedToday: number;
  totalCompletedToday: number;
  completionPercentage: number;
  consecutiveDays: number;
}