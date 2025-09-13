/**
 * Client notes form component for adding notes to clients
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useMutation } from "@tanstack/react-query";
import { clientService, ClientNote, Client } from "@/services/clientService";
import { Loader2 } from "lucide-react";

const clientNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  note_type: z.enum(["general", "service", "billing", "complaint", "compliment"]),
});

type ClientNoteFormData = z.infer<typeof clientNoteSchema>;

interface ClientNotesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSuccess: () => void;
}

export function ClientNotesForm({ open, onOpenChange, client, onSuccess }: ClientNotesFormProps) {
  const [notes, setNotes] = useState<ClientNote[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClientNoteFormData>({
    resolver: zodResolver(clientNoteSchema),
    defaultValues: {
      title: "",
      content: "",
      note_type: "general",
    },
  });

  // Fetch existing notes when client changes
  useEffect(() => {
    if (client && open) {
      clientService.getClientNotes(client.id).then((response) => {
        setNotes(response.data);
      });
    }
  }, [client, open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        title: "",
        content: "",
        note_type: "general",
      });
    }
  }, [open, reset]);

  const { mutate: createNote, isPending: loading } = useMutation({
    mutationFn: (data: ClientNoteFormData) => {
      if (!client) throw new Error("No client selected");
      return clientService.createClientNote({
        ...data,
        client: client.id,
      });
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      // Refresh notes
      if (client) {
        clientService.getClientNotes(client.id).then((response) => {
          setNotes(response.data);
        });
      }
    },
  });

  const onSubmit = (data: ClientNoteFormData) => {
    createNote(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Client Notes - {client?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Notes */}
          {notes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Existing Notes</h3>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.created).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          note.note_type === 'compliment' ? 'bg-green-100 text-green-800' :
                          note.note_type === 'complaint' ? 'bg-red-100 text-red-800' :
                          note.note_type === 'billing' ? 'bg-blue-100 text-blue-800' :
                          note.note_type === 'service' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.note_type}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By: {note.created_by_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Note Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Add New Note</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter note title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note_type">Note Type</Label>
                <Select
                  value={watch("note_type")}
                  onValueChange={(value: "general" | "service" | "billing" | "complaint" | "compliment") => setValue("note_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter note content"
                  rows={4}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Close
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
