import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { dataService, Memorial, FamilyUser, Dedication } from "@/services/dataService";
import { 
  QrCode, Eye, Edit3, LogOut, Heart, Image, Users,
  LayoutGrid, Calendar, MapPin, MessageSquare, ChevronRight,
  Bell, Settings
} from "lucide-react";
import { APP_TITLE } from "@/const";

export default function FamilyDashboard() {
  const [, setLocation] = useLocation();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [familyUser, setFamilyUser] = useState<FamilyUser | null>(null);
  const [recentDedications, setRecentDedications] = useState<Dedication[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [memorialsData, familyUserData, dedicationsData] = await Promise.all([
        dataService.getMemorialsByFamilyUserId(1),
        dataService.getFamilyUserById(1),
        dataService.getDedications()
      ]);
      setMemorials(memorialsData);
      setFamilyUser(familyUserData || null);
      // Get recent dedications for user's memorials
      const userMemorialIds = memorialsData.map(m => m.id);
      const userDedications = dedicationsData.filter(d => userMemorialIds.includes(d.memorialId)).slice(0, 5);
      setRecentDedications(userDedications);
    };
    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return formatDate(dateStr);
  };

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
            onClick={() => setLocation("/")}
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
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-rose-50 text-rose-700 rounded-xl font-medium">
              <LayoutGrid className="w-5 h-5" />
              Meus Memoriais
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              <MessageSquare className="w-5 h-5" />
              Dedicações
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              Notificações
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
              Configurações
            </a>
          </nav>
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={familyUser?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(familyUser?.name || 'U')}&background=BE123C&color=fff`}
              alt={familyUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{familyUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{familyUser?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-gray-600"
            onClick={() => setLocation("/")}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Olá, {familyUser?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500">Gerencie os memoriais da sua família</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card-modern p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{memorials.length}</p>
                <p className="text-sm text-gray-500">Memoriais</p>
              </div>
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{recentDedications.length}</p>
                <p className="text-sm text-gray-500">Dedicações</p>
              </div>
            </div>
          </div>
          <div className="card-modern p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                <Image className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-500">Fotos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Memorials */}
          <div className="lg:col-span-2">
            <div className="card-modern p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Meus Memoriais</h2>
              <div className="space-y-4">
                {memorials.map((memorial, index) => (
                  <div 
                    key={memorial.id} 
                    className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-300 fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img 
                      src={memorial.mainPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(memorial.fullName)}&background=BE123C&color=fff`}
                      alt={memorial.fullName}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{memorial.fullName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {memorial.birthDate?.split('-')[0]} - {memorial.deathDate?.split('-')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {memorial.birthplace}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-gray-600 hover:text-rose-600"
                        onClick={() => setLocation(`/m/${memorial.slug}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        className="btn-secondary text-sm py-1 px-3"
                        onClick={() => setLocation(`/memorial/edit/${memorial.id}`)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Dedications */}
          <div>
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Dedicações Recentes</h2>
                <a href="#" className="text-sm text-rose-600 hover:text-rose-700">Ver todas</a>
              </div>
              <div className="space-y-4">
                {recentDedications.map((dedication, index) => (
                  <div 
                    key={dedication.id} 
                    className="p-4 bg-gray-50 rounded-xl fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={dedication.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(dedication.authorName)}&background=BE123C&color=fff&size=32`}
                        alt={dedication.authorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{dedication.authorName}</p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(dedication.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{dedication.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-modern p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <button 
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                  onClick={() => memorials[0] && setLocation(`/memorial/edit/${memorials[0].id}`)}
                >
                  <Image className="w-5 h-5" />
                  <span className="flex-1">Adicionar Fotos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                  onClick={() => memorials[0] && setLocation(`/memorial/edit/${memorials[0].id}`)}
                >
                  <Users className="w-5 h-5" />
                  <span className="flex-1">Adicionar Descendente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                  onClick={() => memorials[0] && setLocation(`/m/${memorials[0].slug}`)}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="flex-1">Ver QR Code</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
