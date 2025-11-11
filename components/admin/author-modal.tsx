"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  MapPin,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: number;
  name: string;
  surname: string;
  phone: string;
  email: string;
  avatar_path: string;
  review_rating: number;
  role: string;
  is_online: boolean;
  city_id: number;
  created_at: string;
  updated_at: string;
}

interface AuthorModalProps {
  authorId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuthorModal({ authorId, isOpen, onClose }: AuthorModalProps) {
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && authorId) {
      loadAuthorData();
    } else {
      setAuthor(null);
    }
  }, [isOpen, authorId]);

  const loadAuthorData = async () => {
    if (!authorId) return;

    try {
      setIsLoading(true);
      const userData = await apiClient.getUserById(authorId);
      setAuthor(userData);
    } catch (error) {
      console.error("Error loading author data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  if (!authorId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация об авторе
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#aa0400]"></div>
          </div>
        ) : author ? (
          <div className="space-y-6">
            {/* Author Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://api.barlyqqyzmet.kz${author.avatar_path}`}
                  alt={`${author.name} ${author.surname}`}
                />
                <AvatarFallback className="bg-[#aa0400] text-white">
                  {getInitials(author.name, author.surname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {author.name} {author.surname}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={author.is_online ? "default" : "secondary"}>
                    {author.is_online ? "Онлайн" : "Офлайн"}
                  </Badge>
                  <Badge
                    variant={author.role === "admin" ? "default" : "outline"}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {author.role === "admin" ? "Администратор" : "Пользователь"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3">Контактная информация</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">
                      {author.email || "Не указан"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Телефон</div>
                    <div className="font-medium">
                      {author.phone || "Не указан"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Город ID</div>
                    <div className="font-medium">
                      {author.city_id || "Не указан"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="text-sm text-gray-500">Рейтинг</div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {author.review_rating}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.floor(author.review_rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div>
              <h4 className="font-semibold mb-3">Информация об аккаунте</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Дата регистрации
                    </div>
                    <div className="font-medium">
                      {formatDate(author.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Последнее обновление
                    </div>
                    <div className="font-medium">
                      {formatDate(author.updated_at)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ID пользователя</div>
                  <div className="font-medium">#{author.id}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Не удалось загрузить информацию об авторе
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
