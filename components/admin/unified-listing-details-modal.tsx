"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ExternalLink,
  Phone,
  Clock,
  MapIcon,
  Briefcase,
  Home,
} from "lucide-react";
import type { UnifiedListing } from "@/lib/types/listings";

interface UnifiedListingDetailsModalProps {
  listing: UnifiedListing | null;
  isOpen: boolean;
  onClose: () => void;
  onViewAuthor: (authorId: number) => void; // Добавляем пропс
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

export function UnifiedListingDetailsModal({
  listing,
  isOpen,
  onClose,
  onViewAuthor,
}: UnifiedListingDetailsModalProps) {
  if (!listing) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₸";
  };

  // Обработчик клика по кнопке профиля автора
  const handleAuthorProfileClick = () => {
    onViewAuthor(listing.user.id);
  };

  // Type-specific fields rendering
  const renderSpecificFields = () => {
    if (listing.listingType === "work" || listing.listingType === "work_ad") {
      const workListing = listing as any;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Опыт работы:</span>
            <span className="font-medium">{workListing.work_experience}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">График:</span>
            <span className="font-medium">{workListing.schedule}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Удаленная работа:</span>
            <span className="font-medium">
              {workListing.distance_work === "yes" ? "Да" : "Нет"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Период оплаты:</span>
            <span className="font-medium">{workListing.payment_period}</span>
          </div>
          {workListing.city_name && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Город:</span>
              <span className="font-medium">{workListing.city_name}</span>
            </div>
          )}
        </div>
      );
    }

    if (listing.listingType === "rent" || listing.listingType === "rent_ad") {
      const rentListing = listing as any;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Тип аренды:</span>
            <span className="font-medium">{rentListing.rent_type}</span>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Залог:</span>
            <span className="font-medium">{rentListing.deposit} ₸</span>
          </div>
        </div>
      );
    }

    if (
      listing.listingType === "service" ||
      listing.listingType === "service_ad"
    ) {
      const serviceListing = listing as any;
      return (
        <div className="space-y-3">
          {serviceListing.main_category && (
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Основная категория:</span>
              <span className="font-medium">
                {serviceListing.main_category}
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Детали объявления</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{listing.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryColors[listing.category]}>
                  {categoryLabels[listing.category]}
                </Badge>
                <Badge className={variantColors[listing.variant]}>
                  {variantLabels[listing.variant]}
                </Badge>
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
              </div>
              <p className="text-gray-600">{listing.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#aa0400] mb-1">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-gray-500">ID: {listing.id}</div>
              <div className="text-xs text-gray-400">
                Тип: {listing.listingType}
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Основная информация</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Адрес:</span>
                  <span className="font-medium">{listing.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Дата создания:</span>
                  <span className="font-medium">
                    {formatDate(listing.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Обновлено:</span>
                  <span className="font-medium">
                    {formatDate(listing.updated_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Цена:</span>
                  <span className="font-medium text-[#aa0400]">
                    {formatPrice(listing.price)}
                  </span>
                </div>
                {listing.top === "yes" && (
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      Топ объявление
                    </span>
                  </div>
                )}
              </div>

              {/* Type-specific fields */}
              <div className="mt-4">
                <h5 className="font-medium mb-2">Дополнительная информация</h5>
                {renderSpecificFields()}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Автор объявления</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {listing.user.avatar_path && (
                    <img
                      src={`https://api.barlyqqyzmet.kz${listing.user.avatar_path}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {listing.user.name} {listing.user.surname}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {listing.user.id}
                    </div>
                  </div>
                </div>

                {listing.user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Телефон:</span>
                    <span className="font-medium">{listing.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-600">Рейтинг:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {listing.user.review_rating.toFixed(1)}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= Math.floor(listing.user.review_rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({listing.user.reviews_count} отзывов)
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={handleAuthorProfileClick}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Профиль автора
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Media Section */}
          {(listing.images || listing.videos) && (
            <>
              <div>
                <h4 className="font-semibold mb-3">Медиафайлы</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.images && listing.images.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">
                        Изображения ({listing.images.length})
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {listing.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={`https://api.barlyqqyzmet.kz${image.path}`}
                            alt={image.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                      {listing.images.length > 4 && (
                        <p className="text-sm text-gray-500 mt-1">
                          +{listing.images.length - 4} изображений
                        </p>
                      )}
                    </div>
                  )}

                  {listing.videos && listing.videos.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">
                        Видео ({listing.videos.length})
                      </h5>
                      <div className="space-y-2">
                        {listing.videos.slice(0, 2).map((video, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{video.name}</span>
                            <div className="text-gray-500">{video.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
