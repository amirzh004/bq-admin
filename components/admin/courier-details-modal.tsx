"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Calendar,
  Star,
  IdCard,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Courier } from "@/lib/api/courier";
import {
  getCourierApprovalStatus,
  formatCourierName,
  calculateAge,
} from "@/lib/api/courier-utils";

interface CourierDetailsModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourierDetailsModal({
  courier,
  isOpen,
  onClose,
}: CourierDetailsModalProps) {
  if (!courier) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      offline: "secondary",
      busy: "destructive",
      free: "default",
    } as const;

    const labels = {
      online: "Онлайн",
      offline: "Офлайн",
      busy: "Занят",
      free: "Свободен",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Информация о курьере</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {courier.courier_photo ? (
                <img
                  src={courier.courier_photo}
                  alt={formatCourierName(courier)}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-lg">
                {formatCourierName(courier)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {courier.rating?.toFixed(1) || "0.0"}/5
                </div>
                {courier.status && getStatusBadge(courier.status)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <IdCard className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">ИИН</div>
                <div className="text-sm text-gray-600">{courier.iin}</div>
              </div>
            </div>

            {courier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Телефон</div>
                  <div className="text-sm text-gray-600">{courier.phone}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Дата рождения</div>
                <div className="text-sm text-gray-600">
                  {new Date(courier.date_of_birth).toLocaleDateString("ru-RU")}
                  <span className="text-gray-500 ml-2">
                    ({calculateAge(courier.date_of_birth)} лет)
                  </span>
                </div>
              </div>
            </div>

            {courier.balance !== undefined && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="font-medium">Баланс</div>
                  <div className="text-sm text-gray-600">
                    {courier.balance.toLocaleString()} ₸
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Статус подтверждения</div>
                <div className="text-sm">
                  <Badge
                    variant={
                      getCourierApprovalStatus(courier.approval_status).variant
                    }
                  >
                    {getCourierApprovalStatus(courier.approval_status).label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Блокировка</div>
                <div className="text-sm">
                  <Badge variant={courier.banned ? "destructive" : "default"}>
                    {courier.banned ? "Заблокирован" : "Активен"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium">Зарегистрирован</div>
                <div className="text-sm text-gray-600">
                  {new Date(courier.created_at).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              История заказов
            </Button>
            <Button variant="outline" className="flex-1">
              Отправить сообщение
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
