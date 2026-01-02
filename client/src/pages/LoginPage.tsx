import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QrCode, Building2, Users, ArrowLeft, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";

// Demo credentials
const DEMO_EMAIL = "demo@portaldalembranca.com";
const DEMO_PASSWORD = "demo123456";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"funeral_home" | "family">("funeral_home");
  const [isLoading, setIsLoading] = useState(false);

  // tRPC mutations for real authentication
  const funeralHomeLoginMutation = trpc.auth.funeralHomeLogin.useMutation();
  const familyUserLoginMutation = trpc.auth.familyUserLogin.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Check if it's demo mode
      const isDemoMode = email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;

      if (isDemoMode) {
        // Demo mode - simulate login with demo data
        toast.success("Login realizado com sucesso! (Modo Demonstração)");
        
        // Store demo session
        const demoSession = {
          id: 0,
          name: userType === "funeral_home" ? "Funerária Demo" : "Família Demo",
          email: DEMO_EMAIL,
          type: userType,
          isDemo: true,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("userSession", JSON.stringify(demoSession));
        
        if (userType === "funeral_home") {
          setLocation("/dashboard/funeral-home");
        } else {
          setLocation("/dashboard/family");
        }
        return;
      }

      // Real authentication via tRPC
      if (userType === "funeral_home") {
        const result = await funeralHomeLoginMutation.mutateAsync({ email, password });
        
        // Store session
        const session = {
          id: result.id,
          name: result.name,
          email: result.email,
          type: result.type,
          isDemo: false,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("userSession", JSON.stringify(session));
        
        toast.success("Login realizado com sucesso!");
        setLocation("/dashboard/funeral-home");
      } else {
        const result = await familyUserLoginMutation.mutateAsync({ email, password });
        
        // Store session
        const session = {
          id: result.id,
          name: result.name,
          email: result.email,
          type: result.type,
          isDemo: false,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("userSession", JSON.stringify(session));
        
        toast.success("Login realizado com sucesso!");
        setLocation("/dashboard/family");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "E-mail ou senha inválidos");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    toast.info("Credenciais de demonstração preenchidas");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-60 h-60 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{APP_TITLE}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Um lugar para recordar e homenagear.
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-md">
            Acesse sua conta para gerenciar os memoriais e manter vivas as histórias de quem partiu.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-full text-white text-sm" style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
              ✨ Códigos QR Únicos
            </div>
            <div className="px-4 py-2 rounded-full text-white text-sm" style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
              📷 Galerias de Fotos
            </div>
            <div className="px-4 py-2 rounded-full text-white text-sm" style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
              💬 Dedicações
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{APP_TITLE}</span>
          </div>

          <div className="card-modern p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Olá! Acesse sua conta</h2>
            <p className="text-gray-500 mb-8">Preencha seus dados para acessar o portal.</p>

            <Tabs value={userType} onValueChange={(v) => setUserType(v as "funeral_home" | "family")}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="funeral_home"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Funerária
                </TabsTrigger>
                <TabsTrigger 
                  value="family"
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  Família
                </TabsTrigger>
              </TabsList>

              <TabsContent value="funeral_home">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="contato@funeraria.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-modern pl-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-modern pl-12 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      <span className="text-sm text-gray-600">Lembrar-me</span>
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); setLocation("/forgot-password"); }} className="text-sm text-teal-600 hover:text-teal-700">Esqueceu a senha?</a>
                  </div>
                  <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar como Funerária"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="family">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="familia@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-modern pl-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-modern pl-12 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                      <span className="text-sm text-gray-600">Lembrar-me</span>
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); setLocation("/forgot-password"); }} className="text-sm text-rose-600 hover:text-rose-700">Esqueceu a senha?</a>
                  </div>
                  <Button type="submit" className="w-full btn-secondary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar como Família"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Notice */}
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm text-teal-800 text-center mb-3">
                <strong>Quer testar o sistema?</strong>
              </p>
              <button
                onClick={fillDemoCredentials}
                className="w-full text-sm text-teal-700 hover:text-teal-900 font-medium py-2 px-4 rounded-lg bg-teal-100 hover:bg-teal-200 transition-colors"
              >
                Usar credenciais de demonstração
              </button>
              <p className="text-xs text-teal-600 text-center mt-2">
                E-mail: {DEMO_EMAIL}
              </p>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-500 mt-6">
              Não tem uma conta?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setLocation("/register"); }} className="text-teal-600 hover:text-teal-700 font-medium">Registre-se</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
