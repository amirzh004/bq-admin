// app/admin/complaints/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import {
  Search,
  Trash2,
  Download,
  MessageSquareWarning,
  Eye,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Локальные типы для жалоб
type ComplaintCategory = 'services' | 'work' | 'rent';
type ComplaintOfferType = 'provide' | 'seek';
type ComplaintType = 'service' | 'ad' | 'work' | 'work_ad' | 'rent' | 'rent_ad';

interface ComplaintBase {
  id: number;
  user_id: number;
  description: string;
  created_at: string;
  user: {
    name: string;
    surname: string;
    email: string;
    city_id: number;
    avatar_path: string;
    review_rating: number;
  };
}

interface ServiceComplaint extends ComplaintBase {
  service_id: number;
  type: 'service';
}

interface AdComplaint extends ComplaintBase {
  ad_id: number;
  type: 'ad';
}

interface WorkComplaint extends ComplaintBase {
  work_id: number;
  type: 'work';
}

interface WorkAdComplaint extends ComplaintBase {
  work_ad_id: number;
  type: 'work_ad';
}

interface RentComplaint extends ComplaintBase {
  rent_id: number;
  type: 'rent';
}

interface RentAdComplaint extends ComplaintBase {
  rent_ad_id: number;
  type: 'rent_ad';
}

type Complaint = ServiceComplaint | AdComplaint | WorkComplaint | WorkAdComplaint | RentComplaint | RentAdComplaint;

type FilterCategory = "all" | ComplaintCategory;
type FilterOfferType = "all" | ComplaintOfferType;

// Интерфейсы для данных объявлений
interface ServiceListing {
  id: number;
  name: string;
  address: string;
  price: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    phone: string;
    review_rating: number;
    reviews_count: number;
    avatar_path: string;
  };
  images: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  videos: any;
  category_id: number;
  subcategory_id: number;
  description: string;
  avg_rating: number;
  top: "yes" | "no";
  liked: boolean;
  is_responded: boolean;
  status: "pending" | "active" | "archived";
  category_name: string;
  subcategory_name: string;
  main_category: string;
  created_at: string;
  updated_at: string;
}

interface WorkListing {
  id: number;
  name: string;
  address: string;
  price: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    review_rating: number;
    reviews_count: number;
    avatar_path: string;
  };
  images: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  videos: any;
  category_id: number;
  subcategory_id: number;
  description: string;
  avg_rating: number;
  top: "yes" | "no";
  liked: boolean;
  is_responded: boolean;
  status: "pending" | "active" | "archived";
  category_name: string;
  subcategory_name: string;
  work_experience: string;
  city_id: number;
  city_name: string;
  city_type: string;
  schedule: string;
  distance_work: "yes" | "no";
  payment_period: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

interface RentListing {
  id: number;
  name: string;
  address: string;
  price: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    phone: string;
    review_rating: number;
    reviews_count: number;
    avatar_path: string;
  };
  images: Array<{
    name: string;
    path: string;
    type: string;
  }> | null;
  videos: any;
  category_id: number;
  subcategory_id: number;
  description: string;
  avg_rating: number;
  top: "yes" | "no";
  liked: boolean;
  is_responded: boolean;
  status: "pending" | "active" | "archived";
  category_name: string;
  subcategory_name: string;
  rent_type: string;
  deposit: string;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

interface AdListing {
  id: number;
  name: string;
  address: string;
  price: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    phone: string;
    review_rating: number;
    reviews_count: number;
  };
  images: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  videos: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  category_id: number;
  subcategory_id: number;
  description: string;
  avg_rating: number;
  top: "yes" | "no";
  liked: boolean;
  is_responded: boolean;
  status: "pending" | "active" | "archived";
  category_name: string;
  subcategory_name: string;
  created_at: string;
  updated_at: string;
}

type ListingData = ServiceListing | WorkListing | RentListing | AdListing;

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdDate");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [filterOfferType, setFilterOfferType] =
    useState<FilterOfferType>("all");
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error("Error loading complaints:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить жалобы",
        variant: "destructive",
      });
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения ID сущности в зависимости от типа жалобы
  const getEntityId = (complaint: Complaint): number => {
    switch (complaint.type) {
      case "service":
        return complaint.service_id;
      case "ad":
        return complaint.ad_id;
      case "work":
        return complaint.work_id;
      case "work_ad":
        return complaint.work_ad_id;
      case "rent":
        return complaint.rent_id;
      case "rent_ad":
        return complaint.rent_ad_id;
      default:
        return 0;
    }
  };

  // Функция для получения категории жалобы
  const getComplaintCategory = (complaint: Complaint): ComplaintCategory => {
    if (complaint.type === "service" || complaint.type === "ad")
      return "services";
    if (complaint.type === "work" || complaint.type === "work_ad")
      return "work";
    return "rent";
  };

  // Функция для получения типа предложения
  const getComplaintOfferType = (complaint: Complaint): ComplaintOfferType => {
    return complaint.type.includes("_ad") ? "search" : "provide";
  };

  // Функция для получения читаемого названия типа
  const getTypeDisplayName = (complaint: Complaint): string => {
    const categoryNames = {
      services: "Услуги",
      work: "Работа",
      rent: "Аренда и прокат",
    };

    const offerTypeNames = {
      provide: "Предоставляю",
      search: "Ищу",
    };

    const category = getComplaintCategory(complaint);
    const offerType = getComplaintOfferType(complaint);

    return `${categoryNames[category]} (${offerTypeNames[offerType]})`;
  };

  // Функция для получения endpoint'а для загрузки объявления
  const getListingEndpoint = (complaint: Complaint): string => {
    const entityId = getEntityId(complaint);
    
    switch (complaint.type) {
      case "service":
        return `https://api.barlyqqyzmet.kz/service/${entityId}`;
      case "ad":
        return `https://api.barlyqqyzmet.kz/ad/${entityId}`;
      case "work":
        return `https://api.barlyqqyzmet.kz/work/${entityId}`;
      case "work_ad":
        return `https://api.barlyqqyzmet.kz/work_ad/${entityId}`;
      case "rent":
        return `https://api.barlyqqyzmet.kz/rent/${entityId}`;
      case "rent_ad":
        return `https://api.barlyqqyzmet.kz/rent_ad/${entityId}`;
      default:
        return "";
    }
  };

  // Функция для загрузки данных объявления
  const handleViewListing = async (complaint: Complaint) => {
    try {
      setIsListingLoading(true);
      const endpoint = getListingEndpoint(complaint);
      
      if (!endpoint) {
        toast({
          title: "Ошибка",
          description: "Не удалось определить тип объявления",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedListing(data);
      setIsListingModalOpen(true);
    } catch (error) {
      console.error("Error loading listing:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные объявления",
        variant: "destructive",
      });
    } finally {
      setIsListingLoading(false);
    }
  };

  // Фильтрация и сортировка жалоб
  const filteredComplaints = complaints
    .filter((complaint) => {
      // Фильтр по категории
      if (
        filterCategory !== "all" &&
        getComplaintCategory(complaint) !== filterCategory
      ) {
        return false;
      }

      // Фильтр по типу предложения
      if (
        filterOfferType !== "all" &&
        getComplaintOfferType(complaint) !== filterOfferType
      ) {
        return false;
      }

      // Поиск по всем полям
      const searchLower = searchTerm.toLowerCase();
      return (
        complaint.description.toLowerCase().includes(searchLower) ||
        complaint.id.toString().includes(searchTerm) ||
        getEntityId(complaint).toString().includes(searchTerm) ||
        complaint.user_id.toString().includes(searchTerm) ||
        complaint.user.name.toLowerCase().includes(searchLower) ||
        complaint.user.surname.toLowerCase().includes(searchLower) ||
        complaint.user.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "createdDate":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "id":
          return b.id - a.id;
        case "entityId":
          return getEntityId(b) - getEntityId(a);
        case "userId":
          return b.user_id - a.user_id;
        default:
          return 0;
      }
    });

  const handleDelete = async (complaint: Complaint) => {
    try {
      await apiClient.deleteComplaint(complaint.type, complaint.id);
      setComplaints(complaints.filter((c) => c.id !== complaint.id));
      toast({
        title: "Успешно",
        description: "Жалоба удалена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить жалобу",
        variant: "destructive",
      });
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#efefef]">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-64 mt-18">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Загрузка жалоб...</p>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Жалобы</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Просмотр поступивших жалоб от пользователей и управление их обработкой.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск по описанию, ID, пользователю..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={filterCategory}
                      onValueChange={(value: FilterCategory) =>
                        setFilterCategory(value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="services">Услуги</SelectItem>
                        <SelectItem value="work">Работа</SelectItem>
                        <SelectItem value="rent">Аренда и прокат</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filterOfferType}
                      onValueChange={(value: FilterOfferType) =>
                        setFilterOfferType(value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Все типы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="provide">Предоставляю</SelectItem>
                        <SelectItem value="search">Ищу</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Сортировать по" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdDate">
                          По дате создания
                        </SelectItem>
                        <SelectItem value="id">По ID жалобы</SelectItem>
                        <SelectItem value="entityId">По ID Объявлении</SelectItem>
                        <SelectItem value="userId">
                          По ID пользователя
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>ID Объявлении</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {searchTerm ||
                          filterCategory !== "all" ||
                          filterOfferType !== "all"
                            ? "Жалобы не найдены"
                            : "Нет жалоб"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium">
                            #{complaint.id}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {getTypeDisplayName(complaint)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                #{getEntityId(complaint)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewListing(complaint)}
                                disabled={isListingLoading}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {complaint.user.name} {complaint.user.surname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {complaint.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="truncate"
                              title={complaint.description}
                            >
                              {complaint.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(complaint.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewComplaint(complaint)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Удалить жалобу?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Это действие нельзя отменить. Жалоба будет
                                      удалена навсегда.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(complaint)}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Показано {filteredComplaints.length} из {complaints.length}{" "}
                  жалоб
                </span>
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="h-4 w-4" />
                  <span>Всего жалоб: {complaints.length}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <AlertDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <MessageSquareWarning className="h-5 w-5 text-[#aa0400]" />
                Детали жалобы #{selectedComplaint.id}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Тип
                  </label>
                  <p className="text-sm">
                    {getTypeDisplayName(selectedComplaint)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID Объявлении
                  </label>
                  <p className="text-sm">#{getEntityId(selectedComplaint)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID Пользователя
                  </label>
                  <p className="text-sm">#{selectedComplaint.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Пользователь
                  </label>
                  <p className="text-sm">
                    {selectedComplaint.user.name}{" "}
                    {selectedComplaint.user.surname}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email пользователя
                </label>
                <p className="text-sm">{selectedComplaint.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Дата создания
                </label>
                <p className="text-sm">
                  {formatDate(selectedComplaint.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Описание жалобы
                </label>
                <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Закрыть</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Listing Details Modal */}
      <AlertDialog open={isListingModalOpen} onOpenChange={setIsListingModalOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Детали объявления
              {selectedListing && ` #${selectedListing.id}`}
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          {isListingLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400]"></div>
              <p className="ml-2 text-sm text-gray-600">Загрузка данных...</p>
            </div>
          ) : selectedListing ? (
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Название
                  </label>
                  <p className="text-lg font-semibold">{selectedListing.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Цена
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(selectedListing.price)} ₸
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Адрес
                  </label>
                  <p className="text-sm">{selectedListing.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Статус
                  </label>
                  <Badge 
                    variant={
                      selectedListing.status === 'active' ? 'default' : 
                      selectedListing.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {selectedListing.status === 'active' ? 'Активный' : 
                     selectedListing.status === 'pending' ? 'На модерации' : 'Архивирован'}
                  </Badge>
                </div>
              </div>

              {/* Категория и подкатегория */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Категория
                  </label>
                  <p className="text-sm">{selectedListing.category_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Подкатегория
                  </label>
                  <p className="text-sm">{selectedListing.subcategory_name}</p>
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Описание
                </label>
                <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  {selectedListing.description}
                </p>
              </div>

              {/* Дополнительные поля в зависимости от типа */}
              {'work_experience' in selectedListing && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Опыт работы
                  </label>
                  <p className="text-sm">{selectedListing.work_experience}</p>
                </div>
              )}

              {'schedule' in selectedListing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      График работы
                    </label>
                    <p className="text-sm">{selectedListing.schedule}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Удаленная работа
                    </label>
                    <p className="text-sm">
                      {selectedListing.distance_work === 'yes' ? 'Да' : 'Нет'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Период оплаты
                    </label>
                    <p className="text-sm">{selectedListing.payment_period}</p>
                  </div>
                </div>
              )}

              {'rent_type' in selectedListing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Тип аренды
                    </label>
                    <p className="text-sm">{selectedListing.rent_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Депозит
                    </label>
                    <p className="text-sm">{formatPrice(parseInt(selectedListing.deposit))} ₸</p>
                  </div>
                </div>
              )}

              {/* Информация о пользователе */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium mb-4">Информация о пользователе</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Имя и фамилия
                    </label>
                    <p className="text-sm">
                      {selectedListing.user.name} {selectedListing.user.surname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Рейтинг
                    </label>
                    <p className="text-sm">{selectedListing.user.review_rating}</p>
                  </div>
                </div>
              </div>

              {selectedListing.images && selectedListing.images.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Изображения ({selectedListing.images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedListing.images.map((image, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={`https://api.barlyqqyzmet.kz${image.path}`} 
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs text-gray-500 truncate">{image.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Видео */}
              {'videos' in selectedListing && selectedListing.videos && selectedListing.videos.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium mb-4">Видео ({selectedListing.videos.length})</h4>
                  <div className="space-y-4">
                    {selectedListing.videos.map((video, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="text-sm font-medium">{video.name}</p>
                        <p className="text-xs text-gray-500">{video.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Даты создания и обновления */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Дата создания
                  </label>
                  <p className="text-sm">{formatDate(selectedListing.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Дата обновления
                  </label>
                  <p className="text-sm">{formatDate(selectedListing.updated_at)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Не удалось загрузить данные объявления</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Закрыть</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}