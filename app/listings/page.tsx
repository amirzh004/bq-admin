"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UnifiedListingsTable } from "@/components/admin/unified-listings-table"
import { UnifiedListingDetailsModal } from "@/components/admin/unified-listing-details-modal"
import { AuthorModal } from "@/components/admin/author-modal" // Добавляем импорт
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, RefreshCw } from "lucide-react"
import { listingsApi } from "@/lib/api/listings"
import type { UnifiedListing, AllListingsResponse } from "@/lib/types/listings"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UnifiedListingsPage() {
  const [listingsData, setListingsData] = useState<AllListingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterVariant, setFilterVariant] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedListing, setSelectedListing] = useState<UnifiedListing | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  
  // Добавляем состояния для модалки автора
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)

  // Load listings data
  const loadListings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listingsApi.getAllListings()
      setListingsData(data)
    } catch (err) {
      console.error("Failed to load listings:", err)
      setError("Не удалось загрузить объявления. Попробуйте обновить страницу.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  // Filter and sort listings
  const filteredListings =
    listingsData?.unified
      .filter((listing) => {
        const matchesSearch =
          listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.user.surname.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = filterCategory === "all" || listing.category === filterCategory
        const matchesVariant = filterVariant === "all" || listing.variant === filterVariant
        const matchesStatus = filterStatus === "all" || listing.status === filterStatus
        const matchesTab = activeTab === "all" || listing.category === activeTab

        return matchesSearch && matchesCategory && matchesVariant && matchesStatus && matchesTab
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name)
          case "user":
            return `${a.user.name} ${a.user.surname}`.localeCompare(`${b.user.name} ${b.user.surname}`)
          case "created_at":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case "price":
            return b.price - a.price
          case "rating":
            return b.avg_rating - a.avg_rating
          default:
            return 0
        }
      }) || []

  const handleDeleteListing = async (listing: UnifiedListing) => {
    try {
      await listingsApi.deleteListing(listing.id, listing.listingType)
      // Reload listings after deletion
      await loadListings()
    } catch (err) {
      console.error("Failed to delete listing:", err)
      setError("Не удалось удалить объявление. Попробуйте еще раз.")
    }
  }

  const handleViewListing = (listing: UnifiedListing) => {
    setSelectedListing(listing)
    setIsModalOpen(true)
  }

  // Функция для открытия модалки автора
  const handleViewAuthor = (authorId: number) => {
    setSelectedAuthorId(authorId)
    setIsAuthorModalOpen(true)
  }

  const getStatsForCategory = (category: string) => {
    if (!listingsData) return { total: 0, active: 0 }

    const categoryListings =
      category === "all" ? listingsData.unified : listingsData.unified.filter((l) => l.category === category)

    return {
      total: categoryListings.length,
      active: categoryListings.filter((l) => l.status === "active").length,
    }
  }

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
                <p className="mt-2 text-sm text-gray-600">Загрузка объявлений...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efefef]">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64 mt-18">
          <div className="max-w-7xl mx-auto">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tabs for listing categories */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-96">
                <TabsTrigger value="all">Все ({getStatsForCategory("all").total})</TabsTrigger>
                <TabsTrigger value="services">Услуги ({getStatsForCategory("services").total})</TabsTrigger>
                <TabsTrigger value="rent">Прокат ({getStatsForCategory("rent").total})</TabsTrigger>
                <TabsTrigger value="work">Работа ({getStatsForCategory("work").total})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Controls */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск по названию, описанию или автору..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Сортировать по" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">По дате создания</SelectItem>
                      <SelectItem value="name">По названию</SelectItem>
                      <SelectItem value="user">По автору</SelectItem>
                      <SelectItem value="price">По цене</SelectItem>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterVariant} onValueChange={setFilterVariant}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="provide">Предоставляю</SelectItem>
                      <SelectItem value="seek">Ищу</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Активные</SelectItem>
                      <SelectItem value="pending">На модерации</SelectItem>
                      <SelectItem value="inactive">Неактивные</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={loadListings}
                    disabled={loading}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Listings Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <UnifiedListingsTable
                listings={filteredListings}
                onDeleteListing={handleDeleteListing}
                onViewListing={handleViewListing}
                loading={loading}
              />
            </div>

            {/* Stats */}
            {listingsData && (
              <div className="mt-6 bg-white rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Показано {filteredListings.length} из {listingsData.totalCount} объявлений
                  </span>
                  <div className="flex gap-4">
                    <span>Активных: {listingsData.unified.filter((l) => l.status === "active").length}</span>
                    <span>Услуги: {getStatsForCategory("services").total}</span>
                    <span>Прокат: {getStatsForCategory("rent").total}</span>
                    <span>Работа: {getStatsForCategory("work").total}</span>
                    <span>Предоставляю: {listingsData.unified.filter((l) => l.variant === "provide").length}</span>
                    <span>Ищу: {listingsData.unified.filter((l) => l.variant === "seek").length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Listing Details Modal */}
      <UnifiedListingDetailsModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewAuthor={handleViewAuthor} // Передаем функцию для открытия модалки автора
      />

      {/* Author Modal */}
      <AuthorModal
        authorId={selectedAuthorId}
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
      />
    </div>
  )
}