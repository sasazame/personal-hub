'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { Button, Input, Modal, DateRangePicker } from '@/components/ui';
import { MomentListInfinite, MomentForm, MomentViewer, MomentQuickForm } from '@/components/moments';
import { 
  useCreateMoment, 
  useUpdateMoment, 
  useDeleteMoment, 
  useMomentTags
} from '@/hooks/useMoments';
import { useMomentsInfinite } from '@/hooks/useMomentsInfinite';
import { Moment, CreateMomentDto, UpdateMomentDto, MomentFilters } from '@/types/moment';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showSuccess, showError } from '@/components/ui/toast';
import { Plus, Search, Tag } from 'lucide-react';
import { format } from 'date-fns';

const PREVIEW_LENGTH = 100;

function MomentsPage() {
  const t = useTranslations();
  usePageTitle('Moments - Personal Hub');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [viewingMoment, setViewingMoment] = useState<Moment | null>(null);
  const [momentToDelete, setMomentToDelete] = useState<Moment | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});

  const currentFilters: MomentFilters = {
    ...(dateRange.startDate && dateRange.endDate ? {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    } : {}),
    search: searchQuery,
    tags: selectedTag ? [selectedTag] : undefined,
  };

  const { 
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error 
  } = useMomentsInfinite({ filters: currentFilters });
  
  const { data: tags = [] } = useMomentTags();
  const createMutation = useCreateMoment();
  const updateMutation = useUpdateMoment();
  const deleteMutation = useDeleteMoment();

  const handleCreateMoment = (data: CreateMomentDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        showSuccess(t('moments.momentCreated'));
        setIsFormOpen(false);
      },
      onError: (error: Error) => {
        showError(error.message || t('moments.createFailed'));
      },
    });
  };

  const handleUpdateMoment = (data: UpdateMomentDto) => {
    if (selectedMoment?.id) {
      updateMutation.mutate({ id: selectedMoment.id, data }, {
        onSuccess: () => {
          showSuccess(t('moments.momentUpdated'));
          setIsFormOpen(false);
          setSelectedMoment(null);
          setViewingMoment(null);
        },
        onError: (error: Error) => {
          showError(error.message || t('moments.updateFailed'));
        },
      });
    }
  };

  const handleDeleteMoment = () => {
    if (momentToDelete?.id) {
      deleteMutation.mutate(momentToDelete.id, {
        onSuccess: () => {
          showSuccess(t('moments.momentDeleted'));
          setMomentToDelete(null);
          setViewingMoment(null);
        },
        onError: (error: Error) => {
          showError(error.message || t('moments.deleteFailed'));
        },
      });
    }
  };

  const handleNewMoment = () => {
    setSelectedMoment(null);
    setIsFormOpen(true);
  };

  const handleEditMoment = (moment: Moment) => {
    setSelectedMoment(moment);
    setViewingMoment(null);
    setIsFormOpen(true);
  };

  const handleViewMoment = (moment: Moment) => {
    setViewingMoment(moment);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMoment(null);
  };

  const handleCloseViewer = () => {
    setViewingMoment(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-lg text-red-500">Error loading moments: {error.message}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('moments.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('moments.subtitle')}
            </p>
          </div>
          <Button 
            onClick={handleNewMoment}
            gradient="blue"
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
            className="lg:hidden"
          >
            {t('moments.newMoment')}
          </Button>
        </div>

        {/* Quick Form - Fixed at top for PC screens */}
        <div className="hidden lg:block sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-6 px-6 py-4 border-b border-border">
          <MomentQuickForm
            onSubmit={handleCreateMoment}
            isSubmitting={createMutation.isPending}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                label=""
                placeholder={t('moments.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
            placeholder={t('moments.selectDateRange')}
          />

          {/* Tag Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('moments.allTags')}</option>
              {tags.map((tag: string) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {data?.pages?.[0]?.totalElements !== undefined && 
            t('moments.countMoments', { count: data.pages[0].totalElements })}
          {searchQuery && ` (${t('moments.searchResults', { query: searchQuery })})`}
          {selectedTag && ` (${t('moments.tagFilter', { tag: selectedTag })})`}
          {dateRange.startDate && dateRange.endDate && ` (${format(dateRange.startDate, 'yyyy/MM/dd')} - ${format(dateRange.endDate, 'yyyy/MM/dd')})`}
        </div>

        {/* Moment List */}
        <MomentListInfinite
          pages={data?.pages}
          onMomentClick={handleViewMoment}
          onEditMoment={handleEditMoment}
          onDeleteMoment={setMomentToDelete}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
        />

        {/* Moment Form */}
        <MomentForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={selectedMoment ? 
            (data) => handleUpdateMoment(data as UpdateMomentDto) : 
            handleCreateMoment
          }
          moment={selectedMoment || undefined}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        {/* Moment Viewer */}
        <MomentViewer
          moment={viewingMoment}
          isOpen={!!viewingMoment}
          onClose={handleCloseViewer}
          onEdit={() => viewingMoment && handleEditMoment(viewingMoment)}
          onDelete={() => viewingMoment && setMomentToDelete(viewingMoment)}
        />

        {/* Delete Confirmation Modal */}
        {momentToDelete && (
          <Modal open={true} onClose={() => setMomentToDelete(null)}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('moments.deleteMoment')}</h2>
              <p className="text-muted-foreground">
                {t('moments.confirmDelete')}
              </p>
              <div className="text-sm bg-gray-50 dark:bg-gray-800 rounded p-3 mt-2">
                &quot;{momentToDelete.content.substring(0, PREVIEW_LENGTH)}{momentToDelete.content.length > PREVIEW_LENGTH ? '...' : ''}&quot;
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setMomentToDelete(null)}
                  disabled={deleteMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteMoment}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}

export default function Moments() {
  return (
    <AuthGuard>
      <MomentsPage />
    </AuthGuard>
  );
}