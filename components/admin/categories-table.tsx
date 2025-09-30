"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2 } from "lucide-react"

interface Category {
  id: number
  name: string
  image_path?: string
  min_price: number
  created_at: string
  updated_at: string
  subcategories?: Subcategory[]
  type?: string
}

interface Subcategory {
  id: number
  category_id: number
  name: string
  created_at: string
  updated_at: string
  type?: string
}

interface CategoriesTableProps {
  categories: Category[]
  onDeleteCategory: (categoryId: number) => void
  onEditCategory: (category: Category) => void
  onEditSubcategory: (subcategory: Subcategory) => void
  onDeleteSubcategory: (subcategoryId: number) => void
  categoryType: string
}

export function CategoriesTable({ 
  categories, 
  onDeleteCategory, 
  onEditCategory,
  onEditSubcategory,
  onDeleteSubcategory,
  categoryType
}: CategoriesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletingType, setDeletingType] = useState<'category' | 'subcategory'>('category')

  const handleDelete = (id: number, type: 'category' | 'subcategory') => {
    if (type === 'category') {
      onDeleteCategory(id)
    } else {
      onDeleteSubcategory(id)
    }
    setDeletingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>№</TableHead>
          <TableHead>Изображение</TableHead>
          <TableHead>Название категории</TableHead>
          <TableHead>Подкатегории</TableHead>
          <TableHead>Мин. цена</TableHead>
          <TableHead>Дата создания</TableHead>
          <TableHead>Дата обновления</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category, index) => {
          const subcategories = category.subcategories || []
          
          return (
            <>
              {/* Строка категории */}
              <TableRow key={`category-${category.id}`} className="bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {category.image_path ? (
                    <img
                      src={category.image_path}
                      alt={category.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Нет фото</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-500">ID: {category.id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50">
                    {subcategories.length} подкатегорий
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(category.min_price)} ₸</TableCell>
                <TableCell>{formatDate(category.created_at)}</TableCell>
                <TableCell>{formatDate(category.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditCategory(category)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            setDeletingId(category.id)
                            setDeletingType('category')
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить категорию "{category.name}"?
                            {subcategories.length > 0 && (
                              <span className="text-red-600 block mt-2">
                                Внимание: В этой категории есть {subcategories.length} подкатегорий, которые также будут удалены.
                              </span>
                            )}
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id, 'category')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>

              {/* Строки подкатегорий */}
              {subcategories.map((subcategory) => (
                <TableRow key={`subcategory-${subcategory.id}`} className="border-t-0">
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell colSpan={2} className="pl-8">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subcategory.name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditSubcategory(subcategory)}
                          className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                              onClick={() => {
                                setDeletingId(subcategory.id)
                                setDeletingType('subcategory')
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить подкатегорию?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить подкатегорию "{subcategory.name}"?
                                Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(subcategory.id, 'subcategory')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>{formatDate(subcategory.created_at)}</TableCell>
                  <TableCell>{formatDate(subcategory.updated_at)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}