import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { StudyDashboard } from "@/components/StudyDashboard";
import { StudySessionList } from "@/components/StudySessionList";
import { StudySessionForm } from "@/components/StudySessionForm";
import { useStudyData } from "@/hooks/useStudyData";
import { StudySession } from "@/types/study";

const Dashboard = () => {
  const {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession,
    getWeekSessions,
    getTodayStats,
  } = useStudyData();

  const [weekOffset, setWeekOffset] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");

  const weekSessions = getWeekSessions(weekOffset);
  const recentSessions = weekSessions;
  const todayStats = getTodayStats();

  const handleAddSession = (date?: string) => {
    setEditingSession(null);

    if (date) {
      setSelectedDate(date);
    } else {
      // Se não houver data selecionada, use a data atual
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    }
    setIsFormOpen(true);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleStatusChange = (id: string, status: StudySession["status"]) => {
    updateSession(id, { status });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Schedule - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <WeeklySchedule
              sessions={weekSessions}
              onAddSession={handleAddSession}
              onEditSession={handleEditSession}
              onDeleteSession={deleteSession}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
            />
          </div>

          {/* Dashboard Stats */}
          <div>
            <StudyDashboard stats={todayStats} />
          </div>

          {/* Study Sessions List - Full width */}
          <div className="lg:col-span-3">
            <StudySessionList
              sessions={recentSessions}
              onEdit={handleEditSession}
              onDelete={deleteSession}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Floating Add Button */}
        <Button
          onClick={() => handleAddSession()}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[var(--shadow-elevated)] gradient-primary border-0"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Study Session Form Modal */}
        <StudySessionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addSession}
          onUpdate={updateSession}
          editingSession={editingSession}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Dashboard;
