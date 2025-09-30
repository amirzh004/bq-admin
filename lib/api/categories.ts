import { BaseApiClient } from "./base"
import type { Category, Subcategory } from "../types/models"

export class CategoriesApiClient extends BaseApiClient {
  private prefix: string;

  constructor(type: 'services' | 'work' | 'rent') {
    super();
    this.prefix = type === 'services' ? '' : `${type}_`;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.get(`/${this.prefix}category`)
  }

  async createCategory(data: FormData): Promise<Category> {
    return this.request<Category>(`/${this.prefix}category`, {
      method: 'POST',
      body: data,
    })
  }

  async updateCategory(id: number, data: FormData): Promise<Category> {
    return this.request<Category>(`/${this.prefix}category/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteCategory(id: number): Promise<void> {
    return this.delete(`/${this.prefix}category/${id}`)
  }

  // Subcategories
  async createSubcategory(data: { category_id: number; name: string }): Promise<Subcategory> {
    return this.post(`/${this.prefix}subcategory`, data)
  }

  async updateSubcategory(id: number, data: { category_id: number; name: string }): Promise<Subcategory> {
    // Отправляем полные данные с category_id и name
    return this.put(`/${this.prefix}subcategory/${id}`, data)
  }

  async deleteSubcategory(id: number): Promise<void> {
    return this.delete(`/${this.prefix}subcategory/${id}`)
  }
}

export const createCategoriesApi = (type: 'services' | 'work' | 'rent') => new CategoriesApiClient(type)