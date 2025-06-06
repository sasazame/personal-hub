'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { todoApi } from '@/lib/api';
import { Todo } from '@/types/todo';
import { Repeat, Calendar, Clock, Play, Eye, EyeOff, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function RecurringTasksPage() {
  const [instances, setInstances] = useState<{ [key: number]: Todo[] }>({});
  const queryClient = useQueryClient();

  // Fetch recurring tasks
  const { data: recurringTasks, isLoading, error } = useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: todoApi.getRepeatable,
  });

  // Generate instances mutation
  const generateInstancesMutation = useMutation({
    mutationFn: todoApi.generateInstances,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
  });

  // Load instances for a task
  const loadInstances = async (taskId: number) => {
    if (instances[taskId]) {
      setInstances(prev => ({ ...prev, [taskId]: [] }));
      return;
    }

    try {
      const taskInstances = await todoApi.getInstances(taskId);
      setInstances(prev => ({ ...prev, [taskId]: taskInstances }));
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const formatRepeatConfig = (task: Todo) => {
    if (!task.repeatConfig) return '';
    
    const { repeatType, interval = 1, daysOfWeek, dayOfMonth, endDate } = task.repeatConfig;
    
    let text = '';
    
    switch (repeatType) {
      case 'DAILY':
        text = interval === 1 ? '毎日' : `${interval}日おき`;
        break;
      case 'WEEKLY':
        text = interval === 1 ? '毎週' : `${interval}週おき`;
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
          const selectedDays = daysOfWeek.map(d => dayNames[d === 7 ? 0 : d - 1]).join('・');
          text += ` (${selectedDays})`;
        }
        break;
      case 'MONTHLY':
        text = interval === 1 ? '毎月' : `${interval}ヶ月おき`;
        if (dayOfMonth) {
          text += ` ${dayOfMonth}日`;
        }
        break;
      case 'YEARLY':
        text = interval === 1 ? '毎年' : `${interval}年おき`;
        break;
      default:
        text = repeatType;
    }
    
    if (endDate) {
      text += ` (${format(new Date(endDate), 'yyyy年M月d日', { locale: ja })}まで)`;
    }
    
    return text;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'LOW':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center text-red-600">
            繰り返しタスクの読み込みに失敗しました
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Repeat className="h-8 w-8 text-blue-600" />
              繰り返しタスク管理
            </h1>
            <p className="text-muted-foreground mt-2">
              設定された繰り返しタスクの管理と生成済みインスタンスの確認
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => generateInstancesMutation.mutate()}
              disabled={generateInstancesMutation.isPending}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {generateInstancesMutation.isPending ? '生成中...' : 'インスタンス生成'}
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        {!recurringTasks || recurringTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              繰り返しタスクがありません
            </h3>
            <p className="text-muted-foreground mb-4">
              TODOページで繰り返し設定を有効にしてタスクを作成してください
            </p>
            <Button variant="secondary" className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              タスクを作成
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <Card key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Repeat className="h-4 w-4" />
                        {formatRepeatConfig(task)}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          開始: {format(new Date(task.dueDate), 'yyyy年M月d日', { locale: ja })}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        作成: {format(new Date(task.createdAt), 'yyyy年M月d日', { locale: ja })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadInstances(task.id)}
                      className="flex items-center gap-1"
                    >
                      {instances[task.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {instances[task.id] ? 'インスタンスを隠す' : 'インスタンスを表示'}
                    </Button>
                  </div>
                </div>
                
                {/* Instances */}
                {instances[task.id] && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      生成済みインスタンス ({instances[task.id].length}件)
                    </h4>
                    {instances[task.id].length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        まだインスタンスが生成されていません
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {instances[task.id].map((instance) => (
                          <div
                            key={instance.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                                {instance.status}
                              </span>
                              <span className="text-sm text-foreground">
                                {instance.title}
                              </span>
                              {instance.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  期限: {format(new Date(instance.dueDate), 'M月d日', { locale: ja })}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {instance.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default RecurringTasksPage;