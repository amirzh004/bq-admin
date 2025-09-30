"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImagePlus, X } from "lucide-react"

interface Category {
  id: number
  name: string
  image_path?: string
  min_price: number
  created_at: string
  updated_at: string
  subcategories: any[]
}

interface CategoryModalProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (categoryData: FormData) => void
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setImagePreview(category.image_path || null)
      setImageFile(null)
    } else {
      setName("")
      setImageFile(null)
      setImagePreview(null)
    }
    setErrors({})
  }, [category, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Название категории обязательно"
    }

    if (!category && !imageFile) {
      newErrors.image = "Изображение категории обязательно"
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
      const formData = new FormData()
      formData.append("name", name)

      if (imageFile) {
        formData.append("image", imageFile)
      }

      await onSave(formData)
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Редактировать категорию" : "Добавить категорию"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название категории *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название категории"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Изображение категории {!category && "*"}</Label>
            <div className="flex flex-col gap-2">
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Label
                htmlFor="image"
                className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
              >
                <ImagePlus className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {imagePreview ? "Заменить изображение" : "Выберите изображение"}
                </span>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </Label>
            </div>
            {errors.image && (
              <Alert variant="destructive">
                <AlertDescription>{errors.image}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" className="bg-[#aa0400] hover:bg-[#8a0300] text-white" disabled={isLoading}>
              {isLoading ? "Сохранение..." : category ? "Обновить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}