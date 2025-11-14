// app/login/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPhoneNumber, login, parsePhoneNumber, checkAdminAuth } from "@/lib/utils/auth-utils";

function AdminLoginInner() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    useEffect(() => {
        if (checkAdminAuth()) router.push(redirect);
    }, [router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!phone.trim()) { 
            setError("Введите номер телефона"); 
            setIsLoading(false); 
            return; 
        }
        if (!password.trim()) { 
            setError("Введите пароль"); 
            setIsLoading(false); 
            return; 
        }

        try {
            const result = await login(parsePhoneNumber(phone), password);
            if (result.success) {
                if (checkAdminAuth()) router.push(redirect);
                else setError("Ошибка аутентификации. Попробуйте еще раз.");
            } else {
                setError(result.error || "Ошибка авторизации");
            }
        } catch {
            setError("Произошла неожиданная ошибка");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#efefef] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logo.svg"
                            alt="Logo"
                            className="h-12 w-auto"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Админ-панель</CardTitle>
                    <CardDescription>Войдите в систему управления</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Номер телефона</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                value={phone}
                                onChange={(e)=>{ 
                                    setPhone(formatPhoneNumber(e.target.value)); 
                                    if (error) setError(""); 
                                }}
                                placeholder="+7 (___) ___-__-__" 
                                required 
                                maxLength={18} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e)=>{ 
                                    setPassword(e.target.value); 
                                    if (error) setError(""); 
                                }}
                                placeholder="Введите пароль" 
                                required 
                                minLength={1} 
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button 
                            type="submit" 
                            className="w-full bg-[#aa0400] hover:bg-[#8a0300] text-white" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Вход..." : "Войти"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={null}>
            <AdminLoginInner />
        </Suspense>
    );
}

// optional: avoid static prerender attempts for this route
export const dynamic = "force-dynamic";