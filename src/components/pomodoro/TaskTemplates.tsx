'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { showSuccess, showError } from '@/components/ui/toast';
import { Plus, Copy, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TaskTemplate {
  id: string;
  name: string;
  tasks: string[];
}

interface TaskTemplatesProps {
  onApplyTemplate: (tasks: string[]) => void;
  currentTasks?: string[];
}

export function TaskTemplates({ onApplyTemplate, currentTasks = [] }: TaskTemplatesProps) {
  const t = useTranslations('pomodoro.templates');
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    // Load templates from localStorage
    const saved = localStorage.getItem('pomodoroTaskTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const saveTemplates = (newTemplates: TaskTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('pomodoroTaskTemplates', JSON.stringify(newTemplates));
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      showError(t('templateNameRequired'));
      return;
    }

    if (currentTasks.length === 0) {
      showError(t('noTasksToSave'));
      return;
    }

    const newTemplate: TaskTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      tasks: currentTasks
    };

    saveTemplates([...templates, newTemplate]);
    setNewTemplateName('');
    setIsCreating(false);
    showSuccess(t('templateCreated'));
  };

  const handleUpdateTemplate = (template: TaskTemplate) => {
    const updated = templates.map(t => 
      t.id === template.id ? template : t
    );
    saveTemplates(updated);
    setEditingTemplate(null);
    showSuccess(t('templateUpdated'));
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
    showSuccess(t('templateDeleted'));
  };

  const handleApplyTemplate = (template: TaskTemplate) => {
    onApplyTemplate(template.tasks);
    setIsOpen(false);
    showSuccess(t('templateApplied'));
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        title={t('manageTemplates')}
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>

          {/* Create new template section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">{t('createFromCurrent')}</h3>
            {isCreating ? (
              <div className="flex gap-2">
                <Input
                  value={newTemplateName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplateName(e.target.value)}
                  placeholder={t('templateNamePlaceholder')}
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleCreateTemplate()}
                  label=""
                  autoFocus
                />
                <Button onClick={handleCreateTemplate} size="sm">
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => {
                    setIsCreating(false);
                    setNewTemplateName('');
                  }} 
                  size="sm" 
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsCreating(true)} 
                size="sm" 
                variant="outline"
                disabled={currentTasks.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('saveCurrentAsTemplate')}
              </Button>
            )}
          </div>

          {/* Templates list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t('savedTemplates')}</h3>
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noTemplates')}
              </p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    {editingTemplate?.id === template.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingTemplate.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setEditingTemplate({ ...editingTemplate, name: e.target.value })
                          }
                          label=""
                          className="font-medium"
                        />
                        <div className="space-y-2">
                          {editingTemplate.tasks.map((task, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                value={task}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const newTasks = [...editingTemplate.tasks];
                                  newTasks[idx] = e.target.value;
                                  setEditingTemplate({ ...editingTemplate, tasks: newTasks });
                                }}
                                label=""
                              />
                              <Button
                                onClick={() => {
                                  const newTasks = editingTemplate.tasks.filter((_, i) => i !== idx);
                                  setEditingTemplate({ ...editingTemplate, tasks: newTasks });
                                }}
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            onClick={() => {
                              setEditingTemplate({ 
                                ...editingTemplate, 
                                tasks: [...editingTemplate.tasks, ''] 
                              });
                            }}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('addTask')}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdateTemplate(editingTemplate)}
                            size="sm"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {t('save')}
                          </Button>
                          <Button
                            onClick={() => setEditingTemplate(null)}
                            size="sm"
                            variant="outline"
                          >
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => setEditingTemplate(template)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteTemplate(template.id)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          {template.tasks.map((task, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground">
                              • {task}
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleApplyTemplate(template)}
                          size="sm"
                          className="w-full"
                        >
                          {t('useTemplate')}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              {t('close')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}