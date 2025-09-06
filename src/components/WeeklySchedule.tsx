import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudySession } from "@/types/study";

interface WeeklyScheduleProps {
  sessions: StudySession[];
  onAddSession: (date?: string) => void;
  onEditSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

// Função helper para converter Date para string local (YYYY-MM-DD)
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const WeeklySchedule = ({
  sessions,
  onAddSession,
  onEditSession,
  onDeleteSession,
  weekOffset,
  onWeekChange,
}: WeeklyScheduleProps) => {
  const getWeekDates = () => {
    const today = new Date();

    // Calcula a data base para a semana desejada
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + weekOffset * 7);

    // Encontra o domingo desta semana (início da semana)
    const startOfWeek = new Date(targetDate);
    const dayOfWeek = targetDate.getDay(); // 0 = domingo, 1 = segunda, etc.

    // Retrocede para o domingo da semana
    startOfWeek.setDate(targetDate.getDate() - dayOfWeek);

    // Gera todos os 7 dias da semana
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSessionsForDate = (date: Date) => {
    // Usa formatação local em vez de ISO para evitar problemas de timezone
    const dateStr = formatDateToLocal(date);
    return sessions.filter((session) => session.date === dateStr);
  };

  const getStatusColor = (status: StudySession["status"]) => {
    switch (status) {
      case "completed":
        return "status-completed";
      case "pending":
        return "status-pending";
      case "not-done":
        return "status-not-done";
      default:
        return "status-pending";
    }
  };

  const weekDates = getWeekDates();
  const weekTitle =
    weekOffset === 0
      ? "Esta semana"
      : weekOffset === 1
      ? "Próxima semana"
      : weekOffset === -1
      ? "Semana anterior"
      : `${weekOffset > 0 ? "+" : ""}${weekOffset} semanas`;

  return (
    <Card className="card-subtle">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Cronograma Semanal
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(weekOffset - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground min-w-[90px] text-center">
              {weekTitle}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(weekOffset + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {weekDates.map((date, index) => {
          const dayName = DAYS_OF_WEEK[index];
          const daySessions = getSessionsForDate(date);
          const formattedDate = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });

          return (
            <div key={formatDateToLocal(date)} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-card-foreground">
                    {dayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formattedDate}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddSession(formatDateToLocal(date))}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 min-h-[40px]">
                {daySessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Nenhuma sessão agendada
                  </p>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-2 rounded-lg border text-sm cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(
                        session.status
                      )}`}
                      onClick={() => onEditSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {session.startTime} - {session.subject}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive/20"
                        >
                          ×
                        </Button>
                      </div>
                      {session.hoursStudied && (
                        <p className="text-xs opacity-75">
                          {session.hoursStudied.toFixed(1)}h
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
