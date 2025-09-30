"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Category {
  id: number
  name: string
  image_path?: string
  min_price: number
  created_at: string
  updated_at: string
  subcategories: any[]
}

interface Subcategory {
  id: number
  category_id: number
  name: string
  created_at: string
  updated_at: string
}

interface SubcategoryModalProps {
  subcategory: Subcategory | null
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onSave: (subcategoryData: { category_id: number; name: string }) => void
}

export function SubcategoryModal({ subcategory, categories, isOpen, onClose, onSave }: SubcategoryModalProps) {
  const [categoryId, setCategoryId] = useState<string>("")
  const [name, setName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (subcategory) {
      // При редактировании: используем существующую категорию и название
      setCategoryId(subcategory.category_id.toString())
      setName(subcategory.name)
    } else {
      // При создании: сбрасываем форму
      setCategoryId(categories.length > 0 ? categories[0].id.toString() : "")
      setName("")
    }
    setErrors({})
  }, [subcategory, isOpen, categories])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!subcategory && !categoryId) {
      newErrors.category_id = "Выберите категорию"
    }

    if (!name.trim()) {
      newErrors.name = "Название подкатегории обязательно"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (subcategory) {
        // При редактировании: отправляем и category_id, и name
        await onSave({
          category_id: subcategory.category_id, // Берем из существующей подкатегории
          name: name.trim()
        })
      } else {
        // При создании: отправляем выбранную категорию и имя
        await onSave({
          category_id: parseInt(categoryId),
          name: name.trim()
        })
      }
    } catch (error) {
      console.error("Error saving subcategory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Находим категорию для отображения
  const currentCategory = subcategory 
    ? categories.find(cat => cat.id === subcategory.category_id)
    : categories.find(cat => cat.id === parseInt(categoryId))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{subcategory ? "Редактировать подкатегорию" : "Добавить подкатегорию"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Отображаем информацию о категории */}
          <div className="space-y-2">
            <Label htmlFor="category-info">Категория</Label>
            <div className="p-3 border rounded-md bg-gray-50">
              {currentCategory ? (
                <div>
                  <div className="font-medium">{currentCategory.name}</div>
                  <div className="text-sm text-gray-600">ID: {currentCategory.id}</div>
                  {subcategory && (
                    <div className="text-xs text-gray-500 mt-1">
                      Категория определяется автоматически
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">Категория не выбрана</div>
              )}
            </div>
          </div>

          {/* Выбор категории только при создании новой подкатегории */}
          {!subcategory && (
            <div className="space-y-2">
              <Label htmlFor="category">Выберите категорию *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.category_id}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Название подкатегории *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название подкатегории"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" className="bg-[#aa0400] hover:bg-[#8a0300] text-white" disabled={isLoading}>
              {isLoading ? "Сохранение..." : subcategory ? "Обновить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}