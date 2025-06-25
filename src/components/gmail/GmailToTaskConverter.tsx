'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGmailMessages, useConvertEmailToTask } from '@/hooks/useGoogleIntegration';
import { EmailMessage } from '@/services/google-integration';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextArea } from '@/components/ui/TextArea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, ArrowRight, Search, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;


export function GmailToTaskConverter() {
  const [searchQuery, setSearchQuery] = useState('is:unread');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const { data: messages, isLoading, refetch } = useGmailMessages(searchQuery, 20);
  const convertToTask = useConvertEmailToTask();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const handleSearch = () => {
    refetch();
  };

  const handleEmailSelect = (email: EmailMessage) => {
    setSelectedEmail(email);
    setShowTaskForm(true);
    // Pre-fill form with email data
    setValue('title', email.subject);
    setValue('description', `From: ${email.from}\n\n${email.snippet}`);
  };

  const handleConvert = (data: TaskFormData) => {
    if (!selectedEmail) return;

    convertToTask.mutate({
      messageId: selectedEmail.id,
      taskData: data,
    }, {
      onSuccess: () => {
        reset();
        setSelectedEmail(null);
        setShowTaskForm(false);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Messages
          </CardTitle>
          <CardDescription>
            Search and select emails to convert into tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              label=""
              placeholder="Search emails (e.g., is:unread, from:example@email.com)"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              size="sm"
              disabled={isLoading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Email List */}
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading emails...</div>
              </div>
            ) : messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No emails found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages?.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => handleEmailSelect(email)}
                    className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {email.subject || '(No subject)'}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(email.date), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From: {email.from}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {email.snippet}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Task Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Convert to Task
          </CardTitle>
          <CardDescription>
            {selectedEmail ? 'Edit task details before creating' : 'Select an email to convert'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showTaskForm && selectedEmail ? (
            <form onSubmit={handleSubmit(handleConvert)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  label=""
                  {...register('title')}
                  placeholder="Enter task title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  label=""
                  {...register('description')}
                  placeholder="Enter task description"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value) => setValue('priority', value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <div className="relative">
                    <Input
                      id="dueDate"
                      label=""
                      type="date"
                      {...register('dueDate')}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTaskForm(false);
                    setSelectedEmail(null);
                    reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={convertToTask.isPending}
                  className="flex-1"
                >
                  {convertToTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Select an email from the list to convert it into a task
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}