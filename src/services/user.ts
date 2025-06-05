import api from '@/lib/api';
import type { User, UpdateUserDto, ChangePasswordDto } from '@/types/user';

export const userApi = {
  async getById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
    await api.put(`/users/${id}/password`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};