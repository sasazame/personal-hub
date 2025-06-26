export interface User {
  id: string;
  username: string;
  email: string;
  weekStartDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}