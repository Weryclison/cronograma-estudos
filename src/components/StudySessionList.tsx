import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudySession } from "@/types/study";
import { Edit, Trash2, BookOpen, Clock } from "lucide-react";

interface StudySessionListProps {
  sessions: StudySession[];
  onEdit: (session: StudySession) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StudySession["status"]) => void;
}

export const StudySessionList = ({
  sessions,
  onEdit,
  onDelete,
  onStatusChange,
}: StudySessionListProps) => {
  const getStatusVariant = (status: StudySession["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "not-done":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: StudySession["status"]) => {
    switch (status) {
      case "completed":
        return "✅";
      case "pending":
        return "⏳";
      case "not-done":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusText = (status: StudySession["status"]) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      case "not-done":
        return "Não feito";
      default:
        return "Pendente";
    }
  };

  // Group sessions by their actual date (not by Saturday of the week)
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date; // Use the actual date instead of Saturday calculation

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, StudySession[]>);

  // Sort dates (most recent first)
  const sortedDates = Object.keys(sessionsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card className="card-subtle">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Sessões de Estudo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma sessão agendada ainda
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione sua primeira sessão de estudo
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dateSessions = sessionsByDate[date];
              // Gambiarra para domingos - ajusta a data para não mostrar 1 dia antes
              const dateForFormatting = new Date(date + "T00:00:00");
              const today = new Date();
              const isToday = date === today.toISOString().split("T")[0];
              const isSunday = today.getDay() === 0; // 0 = domingo

              let formattedDate;
              if (isToday && isSunday) {
                // Se é hoje e é domingo, força mostrar "domingo" com a data correta
                formattedDate = dateForFormatting.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
              } else {
                formattedDate = dateForFormatting.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
              }

              return (
                <div key={date} className="space-y-3">
                  <h3 className="font-medium text-card-foreground capitalize">
                    {formattedDate}
                  </h3>
                  <div className="space-y-2">
                    {dateSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-card-border rounded-lg p-3 space-y-3 bg-card/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-card-foreground">
                                {session.subject}
                              </h4>
                              <Badge
                                variant={getStatusVariant(session.status)}
                                className="text-xs"
                              >
                                {getStatusIcon(session.status)}{" "}
                                {getStatusText(session.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.startTime} - {session.endTime}
                              </div>
                              {session.hoursStudied && (
                                <span>{session.hoursStudied.toFixed(1)}h</span>
                              )}
                            </div>
                            {session.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {session.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-3 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(session)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(session.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {session.status !== "completed" && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onStatusChange(session.id, "completed")
                              }
                              className="text-xs"
                            >
                              ✅ Marcar como concluído
                            </Button>
                            {session.status !== "not-done" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onStatusChange(session.id, "not-done")
                                }
                                className="text-xs"
                              >
                                ❌ Não consegui fazer
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
