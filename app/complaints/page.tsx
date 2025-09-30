// page.tsx - полностью обновить
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
import {
  apiClient,
  type Complaint,
  type ComplaintCategory,
  type ComplaintOfferType,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type FilterCategory = "all" | ComplaintCategory;
type FilterOfferType = "all" | ComplaintOfferType;

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
      return "service";
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
      service: "Услуги",
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
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64 mt-18">
          <div className="max-w-7xl mx-auto">
            {/* Controls */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  <div className="relative flex-1 max-w-md">
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
                        <SelectItem value="service">Услуги</SelectItem>
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
                        <SelectItem value="entityId">По ID сущности</SelectItem>
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
                      <TableHead>ID Сущности</TableHead>
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
                            <Badge variant="secondary">
                              #{getEntityId(complaint)}
                            </Badge>
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
                    ID Сущности
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
    </div>
  );
}
