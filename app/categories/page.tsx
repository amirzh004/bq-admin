"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CategoriesTable } from "@/components/admin/categories-table"
import { CategoryModal } from "@/components/admin/category-modal"
import { SubcategoryModal } from "@/components/admin/subcategory-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Loader2 } from "lucide-react"
import { createCategoriesApi } from "@/lib/api"
import type { Category, Subcategory } from "@/lib/types/models"

type CategoryType = 'services' | 'work' | 'rent'

const categoryTypeLabels = {
  services: 'Услуги',
  work: 'Работы', 
  rent: 'Прокат и аренда'
}

export default function CategoriesPage() {
  const [currentType, setCurrentType] = useState<CategoryType>('services')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Модальные окна
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false)
  
  // Редактируемые элементы
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)

  // Создаем API клиент для текущего типа
  const categoriesApi = createCategoriesApi(currentType)

  useEffect(() => {
    loadCategories()
  }, [currentType])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await categoriesApi.getCategories()
      const categoriesWithSafeSubcategories = data.map(category => ({
        ...category,
        subcategories: category.subcategories || [],
        type: currentType
      }))
      setCategories(categoriesWithSafeSubcategories)
    } catch (err) {
      setError(`Ошибка при загрузке ${categoryTypeLabels[currentType].toLowerCase()}`)
      console.error("Error loading categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.subcategories || []).some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Обработчики для категорий
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await categoriesApi.deleteCategory(categoryId)
      setCategories(categories.filter((category) => category.id !== categoryId))
    } catch (err) {
      setError(`Ошибка при удалении ${categoryTypeLabels[currentType].toLowerCase()}`)
      console.error("Error deleting category:", err)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (categoryData: FormData) => {
    try {
      if (editingCategory) {
        const updatedCategory = await categoriesApi.updateCategory(editingCategory.id, categoryData)
        const safeUpdatedCategory = {
          ...updatedCategory,
          subcategories: updatedCategory.subcategories || [],
          type: currentType
        }
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? safeUpdatedCategory : cat)))
      } else {
        const newCategory = await categoriesApi.createCategory(categoryData)
        const safeNewCategory = {
          ...newCategory,
          subcategories: newCategory.subcategories || [],
          type: currentType
        }
        setCategories([...categories, safeNewCategory])
      }
      setIsCategoryModalOpen(false)
      setEditingCategory(null)
    } catch (err) {
      setError(`Ошибка при сохранении ${categoryTypeLabels[currentType].toLowerCase()}`)
      console.error("Error saving category:", err)
    }
  }

  // Обработчики для подкатегорий
  const handleAddSubcategory = () => {
    setEditingSubcategory(null)
    setIsSubcategoryModalOpen(true)
  }

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setIsSubcategoryModalOpen(true)
  }

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    try {
      await categoriesApi.deleteSubcategory(subcategoryId)
      setCategories(categories.map(category => ({
        ...category,
        subcategories: (category.subcategories || []).filter(sub => sub.id !== subcategoryId)
      })))
    } catch (err) {
      setError(`Ошибка при удалении подкатегории`)
      console.error("Error deleting subcategory:", err)
    }
  }

const handleSaveSubcategory = async (subcategoryData: { category_id: number; name: string }) => {
  try {
    if (editingSubcategory) {
      // При редактировании: отправляем category_id из редактируемой подкатегории и новое имя
      const dataToSend = {
        category_id: editingSubcategory.category_id, // Берем из существующей подкатегории
        name: subcategoryData.name
      }
      const updatedSubcategory = await categoriesApi.updateSubcategory(editingSubcategory.id, dataToSend)
      setCategories(categories.map(category => ({
        ...category,
        subcategories: (category.subcategories || []).map(sub => 
          sub.id === editingSubcategory.id ? { ...updatedSubcategory, type: currentType } : sub
        )
      })))
    } else {
      // При создании: отправляем выбранную категорию и имя
      const newSubcategory = await categoriesApi.createSubcategory(subcategoryData)
      setCategories(categories.map(category => 
        category.id === subcategoryData.category_id 
          ? { 
              ...category, 
              subcategories: [...(category.subcategories || []), { ...newSubcategory, type: currentType }] 
            }
          : category
      ))
    }
    setIsSubcategoryModalOpen(false)
    setEditingSubcategory(null)
  } catch (err) {
    setError("Ошибка при сохранении подкатегории")
    console.error("Error saving subcategory:", err)
  }
}

  const totalSubcategories = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Загрузка {categoryTypeLabels[currentType].toLowerCase()}...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <AdminHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 mt-[73px] lg:ml-64 w-full lg:w-[calc(100%-16rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Категории</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Список категорий объявлений и управление их структурой.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
                <Button variant="outline" size="sm" className="ml-4 cursor-pointer" onClick={loadCategories}>
                  Повторить
                </Button>
              </div>
            )}

            {/* Controls */}
            <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск по названию..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Tabs value={currentType} onValueChange={(value) => setCurrentType(value as CategoryType)}>
                    <TabsList>
                      <TabsTrigger 
                        value="services" 
                        className={currentType === 'services' ? 'cursor-default' : 'cursor-pointer'}
                      >
                        Услуги
                      </TabsTrigger>
                      <TabsTrigger 
                        value="work" 
                        className={currentType === 'work' ? 'cursor-default' : 'cursor-pointer'}
                      >
                        Работы
                      </TabsTrigger>
                      <TabsTrigger 
                        value="rent" 
                        className={currentType === 'rent' ? 'cursor-default' : 'cursor-pointer'}
                      >
                        Прокат и аренда
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSubcategory}
                    className="cursor-pointer bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Добавить подкатегорию
                  </Button>
                  <Button
                    onClick={handleAddCategory}
                    className="cursor-pointer bg-[#aa0400] hover:bg-[#8a0300] text-white flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить категорию
                  </Button>
                </div>
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <CategoriesTable
                categories={filteredCategories}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={handleEditCategory}
                onEditSubcategory={handleEditSubcategory}
                onDeleteSubcategory={handleDeleteSubcategory}
                categoryType={currentType}
              />
            </div>

            {/* Stats */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Показано {filteredCategories.length} из {categories.length} категорий ({categoryTypeLabels[currentType]})
                </span>
                <div className="flex gap-4">
                  <span>Всего подкатегорий: {totalSubcategories}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Category Modal */}
      <CategoryModal
        category={editingCategory}
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setEditingCategory(null)
        }}
        onSave={handleSaveCategory}
      />

      {/* Subcategory Modal */}
      <SubcategoryModal
        subcategory={editingSubcategory}
        categories={categories}
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false)
          setEditingSubcategory(null)
        }}
        onSave={handleSaveSubcategory}
      />
    </div>
  )
}