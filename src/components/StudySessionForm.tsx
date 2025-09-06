import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudySession } from "@/types/study";

// Função para gerar opções de horário a partir do horário de início
const generateTimeOptions = (startTime: string) => {
  const options = [];

  // Converte o horário de início para minutos desde meia-noite
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;

  // Adiciona 30 minutos para começar com o próximo horário válido
  let currentMinutes = startTotalMinutes + 30;

  // Gera opções até 23:30 (evita cruzar a meia-noite)
  while (currentMinutes < 24 * 60) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;

    // Formata o horário como HH:MM
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const timeValue = `${formattedHours}:${formattedMinutes}`;

    options.push({
      value: timeValue,
      label: timeValue,
    });

    // Incrementa em 30 minutos
    currentMinutes += 30;
  }

  return options;
};

interface StudySessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: Omit<StudySession, "id" | "hoursStudied">) => void;
  onUpdate?: (id: string, updates: Partial<StudySession>) => void;
  editingSession?: StudySession | null;
  selectedDate?: string;
}

export const StudySessionForm = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingSession,
  selectedDate,
}: StudySessionFormProps) => {
  const [formData, setFormData] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    date: "",
    notes: "",
    status: "pending" as StudySession["status"],
  });

  useEffect(() => {
    if (editingSession) {
      setFormData({
        subject: editingSession.subject,
        startTime: editingSession.startTime,
        endTime: editingSession.endTime,
        date: editingSession.date,
        notes: editingSession.notes || "",
        status: editingSession.status,
      });
    } else {
      // Reset form for new session
      // Use selectedDate if provided, otherwise use today's date
      const today = new Date().toISOString().split("T")[0];
      const finalDate = selectedDate || today;
      console.log("StudySessionForm - finalDate antes de setar:", finalDate);
      setFormData({
        subject: "",
        startTime: "",
        endTime: "",
        date: finalDate,
        notes: "",
        status: "pending",
      });
    }
  }, [editingSession, isOpen, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.subject ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.date
    ) {
      return;
    }

    if (editingSession && onUpdate) {
      onUpdate(editingSession.id, formData);
    } else {
      onSubmit(formData);
    }

    onClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form after close animation
    setTimeout(() => {
      setFormData({
        subject: "",
        startTime: "",
        endTime: "",
        date: "",
        notes: "",
        status: "pending",
      });
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? "Editar Sessão" : "Nova Sessão de Estudo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Matéria</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Ex: Matemática, História..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora início</Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => {
                  // Ao mudar o horário de início, resetamos o horário de fim se ele for anterior ao novo início
                  const newStartTime = value;
                  let newEndTime = formData.endTime;

                  if (formData.endTime && newStartTime >= formData.endTime) {
                    // Se o novo horário de início for maior ou igual ao horário de fim atual,
                    // resetamos o horário de fim
                    newEndTime = "";
                  }

                  setFormData((prev) => ({
                    ...prev,
                    startTime: newStartTime,
                    endTime: newEndTime,
                  }));
                }}
              >
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <SelectItem
                      key={`hour-${hour}`}
                      value={`${hour.toString().padStart(2, "0")}:00`}
                    >
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora fim</Label>
              <Select
                value={formData.endTime}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, endTime: value }))
                }
                disabled={!formData.startTime} // Desabilita se não houver horário de início
              >
                <SelectTrigger id="endTime">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formData.startTime
                    ? // Gera opções de horário a partir de 30 minutos após o horário de início
                      generateTimeOptions(formData.startTime).map(
                        (timeOption) => (
                          <SelectItem
                            key={timeOption.value}
                            value={timeOption.value}
                          >
                            {timeOption.label}
                          </SelectItem>
                        )
                      )
                    : null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: StudySession["status"]) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">⏳ Pendente</SelectItem>
                <SelectItem value="completed">✅ Concluído</SelectItem>
                <SelectItem value="not-done">❌ Não feito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Adicione observações sobre esta sessão..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {editingSession ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
