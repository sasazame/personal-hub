'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthGuard } from '@/components/auth';
import { Header } from '@/components/layout';
import { Card, Input, Button, Modal, ModalHeader, ModalTitle, ModalContent } from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { userApi } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { UpdateUserDto, ChangePasswordDto } from '@/types/user';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function ProfilePage() {
  const t = useTranslations();
  usePageTitle('Profile - Personal Hub');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch user details
  const { data: userDetails } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => user?.id ? userApi.getById(user.id) : null,
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => userApi.update(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      setIsEditingProfile(false);
      showSuccess(t('profile.profileUpdated'));
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => userApi.changePassword(user!.id, data),
    onSuccess: () => {
      setIsChangingPassword(false);
      showSuccess(t('profile.passwordChanged'));
      changePasswordForm.reset();
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.delete(user!.id),
    onSuccess: async () => {
      showSuccess(t('profile.accountDeleted'));
      await logout();
      router.push('/register');
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : t('errors.general'));
    },
  });

  // Profile update form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: userDetails?.username || user?.username || '',
      email: userDetails?.email || user?.email || '',
    },
  });

  // Password change form
  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileUpdate = (data: UpdateProfileFormData) => {
    const updateData: UpdateUserDto = {};
    if (data.username && data.username !== userDetails?.username) {
      updateData.username = data.username;
    }
    if (data.email && data.email !== userDetails?.email) {
      updateData.email = data.email;
    }
    
    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    } else {
      showError('No changes to update');
    }
  };

  const handlePasswordChange = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const displayUser = userDetails || user;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {t('common.back')}
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{t('profile.personalInfo')}</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              {t('common.edit')}
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">{t('auth.username')}</label>
              <p className="text-lg">{displayUser?.username}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t('auth.email')}</label>
              <p className="text-lg">{displayUser?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t('todo.createdAt')}</label>
              <p className="text-lg">
                {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('profile.accountSettings')}</h2>
          <Button
            variant="secondary"
            onClick={() => setIsChangingPassword(true)}
          >
            {t('profile.changePassword')}
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h2 className="text-xl font-semibold mb-4 text-destructive">{t('profile.dangerZone')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('profile.confirmAccountDelete')}
          </p>
          <Button
            variant="danger"
            onClick={() => setIsDeletingAccount(true)}
          >
            {t('profile.deleteAccount')}
          </Button>
        </Card>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <Modal open={isEditingProfile} onClose={() => setIsEditingProfile(false)}>
            <ModalHeader onClose={() => setIsEditingProfile(false)}>
              <ModalTitle>{t('profile.editProfile')}</ModalTitle>
            </ModalHeader>
            
            <ModalContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div>
                  <Input
                    {...profileForm.register('username')}
                    type="text"
                    id="username"
                    label={t('auth.username')}
                    error={profileForm.formState.errors.username?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...profileForm.register('email')}
                    type="email"
                    id="email"
                    label={t('auth.email')}
                    error={profileForm.formState.errors.email?.message}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={updateProfileMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? t('common.loading') : t('profile.updateProfile')}
                  </Button>
                </div>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* Change Password Modal */}
        {isChangingPassword && (
          <Modal open={isChangingPassword} onClose={() => setIsChangingPassword(false)}>
            <ModalHeader onClose={() => setIsChangingPassword(false)}>
              <ModalTitle>{t('profile.changePassword')}</ModalTitle>
            </ModalHeader>
            
            <ModalContent>
              <form onSubmit={changePasswordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <div>
                  <Input
                    {...changePasswordForm.register('currentPassword')}
                    type="password"
                    id="currentPassword"
                    label={t('profile.currentPassword')}
                    error={changePasswordForm.formState.errors.currentPassword?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...changePasswordForm.register('newPassword')}
                    type="password"
                    id="newPassword"
                    label={t('profile.newPassword')}
                    error={changePasswordForm.formState.errors.newPassword?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...changePasswordForm.register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    label={t('profile.confirmNewPassword')}
                    error={changePasswordForm.formState.errors.confirmPassword?.message}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsChangingPassword(false)}
                    disabled={changePasswordMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? t('common.loading') : t('common.save')}
                  </Button>
                </div>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* Delete Account Modal */}
        {isDeletingAccount && (
          <Modal open={isDeletingAccount} onClose={() => setIsDeletingAccount(false)}>
            <ModalHeader onClose={() => setIsDeletingAccount(false)}>
              <ModalTitle className="text-destructive">{t('profile.deleteAccount')}</ModalTitle>
            </ModalHeader>
            
            <ModalContent>
              <p className="text-muted-foreground mb-4">
                {t('profile.confirmAccountDelete')}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeletingAccount(false)}
                  disabled={deleteAccountMutation.isPending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? t('common.loading') : t('profile.deleteAccount')}
                </Button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </main>
    </div>
  );
}

export default function ProfilePageWithAuth() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}