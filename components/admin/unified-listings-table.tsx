"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Eye, Trash2, Star, Calendar } from "lucide-react";
import type { UnifiedListing } from "@/lib/types/listings";

interface UnifiedListingsTableProps {
  listings: UnifiedListing[];
  onDeleteListing: (listing: UnifiedListing) => void;
  onViewListing: (listing: UnifiedListing) => void;
  loading?: boolean;
}

const categoryLabels = {
  services: "Услуги",
  rent: "Прокат",
  work: "Работа",
};

const variantLabels = {
  provide: "Предоставляю",
  seek: "Ищу",
};

const categoryColors = {
  services: "bg-blue-100 text-blue-800",
  rent: "bg-green-100 text-green-800",
  work: "bg-purple-100 text-purple-800",
};

const variantColors = {
  provide: "bg-emerald-100 text-emerald-800",
  seek: "bg-orange-100 text-orange-800",
};

const statusLabels = {
  active: "Активное",
  pending: "На модерации",
  inactive: "Неактивное",
};

export function UnifiedListingsTable({
  listings,
  onDeleteListing,
  onViewListing,
  loading,
}: UnifiedListingsTableProps) {
  const [deletingListing, setDeletingListing] = useState<UnifiedListing | null>(
    null
  );

  const handleDelete = (listing: UnifiedListing) => {
    onDeleteListing(listing);
    setDeletingListing(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₸";
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Загрузка объявлений...</div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Объявления не найдены</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Объявление</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Тип</TableHead>
          <TableHead>Автор</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Дата создания</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Рейтинг</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((listing) => (
          <TableRow key={`${listing.listingType}-${listing.id}`}>
            <TableCell className="max-w-xs">
              <div>
                <div className="font-medium">
                  {truncateText(listing.name, 40)}
                </div>
                <div className="text-sm text-gray-500">
                  {truncateText(listing.description, 60)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {listing.address}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={categoryColors[listing.category]}>
                {categoryLabels[listing.category]}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={variantColors[listing.variant]}>
                {variantLabels[listing.variant]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {listing.user.avatar_path && (
                  <img
                    src={`https://api.barlyqqyzmet.kz${listing.user.avatar_path}`}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">
                    {listing.user.name} {listing.user.surname}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {listing.user.review_rating.toFixed(1)} (
                    {listing.user.reviews_count})
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium text-[#aa0400]">
                {formatPrice(listing.price)}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {formatDate(listing.created_at)}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  listing.status === "active"
                    ? "default"
                    : listing.status === "pending"
                    ? "secondary"
                    : "outline"
                }
              >
                {statusLabels[listing.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {listing.avg_rating.toFixed(1)}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewListing(listing)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => setDeletingListing(listing)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить объявление?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить объявление "
                        {listing.name}"? Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(listing)}
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
        ))}
      </TableBody>
    </Table>
  );
}
