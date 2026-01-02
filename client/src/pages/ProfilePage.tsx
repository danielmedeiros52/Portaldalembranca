import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, Mail, Phone, Camera, Lock, Eye, EyeOff, 
  ArrowLeft, Loader2, Shield, Bell, CreditCard,
  LogOut, Heart, QrCode, Settings, LayoutGrid, CheckCircle
} from "lucide-react";
import { APP_TITLE } from "@/const";
import { authService, User as UserType, UpdateProfileData, ChangePasswordData } from "@/services/authService";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User data
  const [user, setUser] = useState<UserType | null>(null);
  
  // Profile form
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: "",
    email: "",
    phone: "",
    photo: ""
  });

  // Password form
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification preferences (mock)
  const [notifications, setNotifications] = useState({
    emailDedications: true,
    emailUpdates: true,
    emailMarketing: false,
    pushDedications: true,
    pushUpdates: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from the API
      // For demo, we'll set mock data
      const mockUser: UserType = {
        id: 1,
        name: "Ana Carolina Santos",
        email: "ana.santos@email.com",
        phone: "(81) 99999-1234",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        userType: "family",
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString()
      };
      
      // Set mock user in auth service for demo
      authService.setMockUser(mockUser);
      
      setUser(mockUser);
      setProfileData({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        photo: mockUser.photo
      });
    } catch (error) {
      toast.error("Erro ao carregar dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    if (!profileData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error("Por favor, informe um e-mail válido.");
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        toast.success(response.message);
        if (response.user) {
          setUser(response.user);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await authService.changePassword(passwordData);
      
      if (response.success) {
        toast.success(response.message);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast.success("Logout realizado com sucesso.");
    setLocation("/");
  };

  const handlePhotoUpload = () => {
    // In a real app, this would open a file picker and upload to S3/cloud storage
    toast.info("Funcionalidade de upload de foto será implementada com a integração do backend.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">{APP_TITLE}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">{APP_TITLE}</span>
          </div>

          <nav className="space-y-1">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setLocation("/dashboard/family"); }}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <LayoutGrid className="w-5 h-5" />
              Meus Memoriais
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-rose-50 text-rose-700 rounded-xl font-medium">
              <Settings className="w-5 h-5" />
              Configurações
            </a>
          </nav>
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=BE123C&color=fff`}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
        {/* Back Button (Mobile) */}
        <button 
          onClick={() => setLocation("/dashboard/family")}
          className="md:hidden flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Configurações da Conta</h1>
          <p className="text-gray-500">Gerencie seu perfil e preferências</p>
        </div>

        {/* Profile Card */}
        <div className="card-modern p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img 
                src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=BE123C&color=fff&size=128`}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              <button 
                onClick={handlePhotoUpload}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="badge-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conta ativa
                </span>
                <span className="text-xs text-gray-400">
                  Membro desde {new Date(user?.createdAt || '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full sm:w-auto">
            <TabsTrigger 
              value="profile"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger 
              value="billing"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Pessoais</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="input-modern pl-12"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="input-modern pl-12"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                      className="input-modern pl-12"
                      maxLength={15}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar alterações"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Alterar Senha</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Digite sua senha atual"
                      className="input-modern pl-12 pr-12"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Mínimo 6 caracteres"
                      className="input-modern pl-12 pr-12"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repita a nova senha"
                      className="input-modern pl-12 pr-12"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength */}
                {passwordData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 10 && /[A-Z]/.test(passwordData.newPassword) ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 10 && /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {passwordData.newPassword.length < 6 ? "Senha muito curta" : 
                       passwordData.newPassword.length < 8 ? "Senha razoável" :
                       passwordData.newPassword.length < 10 ? "Senha boa" : "Senha forte"}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    "Alterar senha"
                  )}
                </Button>
              </form>


            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferências de Notificação</h3>
              
              <div className="space-y-6 max-w-lg">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Notificações por E-mail</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-700">Novas dedicações</p>
                        <p className="text-sm text-gray-500">Receba e-mail quando alguém deixar uma dedicação</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifications.emailDedications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailDedications: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-700">Atualizações do sistema</p>
                        <p className="text-sm text-gray-500">Novidades e melhorias da plataforma</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifications.emailUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-700">Marketing</p>
                        <p className="text-sm text-gray-500">Promoções e ofertas especiais</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifications.emailMarketing}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailMarketing: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Notificações Push</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-700">Novas dedicações</p>
                        <p className="text-sm text-gray-500">Notificação instantânea no navegador</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifications.pushDedications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, pushDedications: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-700">Atualizações importantes</p>
                        <p className="text-sm text-gray-500">Alertas sobre sua conta</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifications.pushUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, pushUpdates: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                    </label>
                  </div>
                </div>

                <Button 
                  className="btn-secondary"
                  onClick={() => toast.success("Preferências salvas com sucesso!")}
                >
                  Salvar preferências
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pagamentos e Assinatura</h3>
              
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Plano Atual</p>
                      <p className="text-2xl font-bold text-rose-600">Memorial Básico</p>
                    </div>
                    <span className="badge-success">Ativo</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Gerencie seu plano e desbloqueie mais recursos.
                  </p>
                  <Button 
                    className="btn-secondary"
                    onClick={() => setLocation("/checkout")}
                  >
                    Fazer upgrade
                  </Button>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Métodos de Pagamento</h4>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Nenhum método de pagamento cadastrado</p>
                    <Button 
                      variant="outline" 
                      className="btn-outline"
                      onClick={() => setLocation("/checkout")}
                    >
                      Adicionar cartão
                    </Button>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Histórico de Pagamentos</h4>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-gray-500">Nenhum pagamento realizado ainda.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
