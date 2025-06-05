export interface User {
  id: number;
  username: string;
  email: string;
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