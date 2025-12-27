import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AcceptInvitationPage() {
  const [match, params] = useRoute("/accept-invitation/:token");
  const [, setLocation] = useLocation();
  const token = params?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const acceptInvitationMutation = trpc.auth.acceptInvitation.useMutation();

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      await acceptInvitationMutation.mutateAsync({
        token: token!,
        password,
      });
      toast.success("Conta criada com sucesso! Você pode fazer login agora.");
      setLocation("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao aceitar convite");
    }
  };

  if (!match || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <Card className="w-full max-w-md border-primary/20">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium">Link de convite inválido</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Complete Sua Conta</CardTitle>
          <CardDescription>Defina sua senha para acessar o memorial</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={acceptInvitationMutation.isPending}
            >
              {acceptInvitationMutation.isPending ? "Criando Conta..." : "Criar Conta"}
            </Button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-4">
            A senha deve ter pelo menos 6 caracteres
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
