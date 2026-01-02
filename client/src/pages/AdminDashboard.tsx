import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { dataService, Memorial, FuneralHome, FamilyUser } from "@/services/dataService";
import { 
  Shield, LogOut, LayoutDashboard, FileText, Users, Building2, 
  ClipboardList, Settings, Bell, Search, Plus, Eye, Edit3,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Package,
  ChevronRight, Filter, MoreVertical, Calendar, MapPin,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
  UserPlus, MessageSquare, Truck, XCircle, PlayCircle
} from "lucide-react";
import { APP_TITLE } from "@/const";

// Types
interface AdminSession {
  id: number;
  name: string;
  email: string;
  type: string;
  loginTime: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface Order {
  id: number;
  memorialId: number;
  funeralHomeId: number;
  familyUserId?: number;
  productionStatus: string;
  priority: string;
  notes?: string;
  internalNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalMemorials: number;
  activeMemorials: number;
  pendingMemorials: number;
  totalLeads: number;
  pendingLeads: number;
  totalOrders: number;
  newOrders: number;
  inProductionOrders: number;
  waitingDataOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  totalFuneralHomes: number;
  totalFamilyUsers: number;
}

// Status configurations
const productionStatusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  new: { label: "Novo", color: "text-blue-600", icon: Plus, bgColor: "bg-blue-100" },
  in_production: { label: "Em Produção", color: "text-amber-600", icon: PlayCircle, bgColor: "bg-amber-100" },
  waiting_data: { label: "Aguardando Dados", color: "text-orange-600", icon: Clock, bgColor: "bg-orange-100" },
  ready: { label: "Pronto", color: "text-emerald-600", icon: CheckCircle2, bgColor: "bg-emerald-100" },
  delivered: { label: "Entregue", color: "text-green-600", icon: Truck, bgColor: "bg-green-100" },
  cancelled: { label: "Cancelado", color: "text-red-600", icon: XCircle, bgColor: "bg-red-100" },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: "Baixa", color: "text-slate-600", bgColor: "bg-slate-100" },
  normal: { label: "Normal", color: "text-blue-600", bgColor: "bg-blue-100" },
  high: { label: "Alta", color: "text-amber-600", bgColor: "bg-amber-100" },
  urgent: { label: "Urgente", color: "text-red-600", bgColor: "bg-red-100" },
};

const leadStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendente", color: "text-amber-600", bgColor: "bg-amber-100" },
  contacted: { label: "Contatado", color: "text-blue-600", bgColor: "bg-blue-100" },
  converted: { label: "Convertido", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  rejected: { label: "Rejeitado", color: "text-red-600", bgColor: "bg-red-100" },
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "leads" | "memorials" | "funeralhomes" | "families" | "settings">("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalMemorials: 0,
    activeMemorials: 0,
    pendingMemorials: 0,
    totalLeads: 0,
    pendingLeads: 0,
    totalOrders: 0,
    newOrders: 0,
    inProductionOrders: 0,
    waitingDataOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    totalFuneralHomes: 0,
    totalFamilyUsers: 0,
  });
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [funeralHomes, setFuneralHomes] = useState<FuneralHome[]>([]);
  const [familyUsers, setFamilyUsers] = useState<FamilyUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDialog, setShowLeadDialog] = useState(false);

  // Check admin session
  useEffect(() => {
    const session = localStorage.getItem("adminSession");
    if (!session) {
      setLocation("/admin/login");
      return;
    }
    try {
      const parsed = JSON.parse(session);
      setAdminSession(parsed);
    } catch {
      localStorage.removeItem("adminSession");
      setLocation("/admin/login");
    }
  }, [setLocation]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [memorialsData, funeralHomesData, familyUsersData] = await Promise.all([
          dataService.getMemorials(),
          dataService.getFuneralHomes(),
          dataService.getFamilyUsers(),
        ]);

        setMemorials(memorialsData);
        setFuneralHomes(funeralHomesData);
        setFamilyUsers(familyUsersData);

        // Calculate stats from local data
        const activeMemorials = memorialsData.filter(m => m.status === "active").length;
        const pendingMemorials = memorialsData.filter(m => m.status === "pending_data").length;

        // Mock leads data
        const mockLeads: Lead[] = [
          { id: 1, name: "Maria Santos", email: "maria@email.com", phone: "(11) 99999-1111", status: "pending", createdAt: new Date().toISOString() },
          { id: 2, name: "João Oliveira", email: "joao@email.com", phone: "(11) 99999-2222", status: "contacted", createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, name: "Ana Costa", email: "ana@email.com", phone: "(11) 99999-3333", status: "pending", createdAt: new Date(Date.now() - 172800000).toISOString() },
        ];
        setLeads(mockLeads);

        // Mock orders data based on memorials
        const mockOrders: Order[] = memorialsData.slice(0, 5).map((m, i) => ({
          id: i + 1,
          memorialId: m.id,
          funeralHomeId: m.funeralHomeId,
          familyUserId: m.familyUserId,
          productionStatus: ["new", "in_production", "waiting_data", "ready", "delivered"][i % 5],
          priority: ["normal", "high", "urgent", "normal", "low"][i % 5],
          notes: `Pedido do memorial ${m.fullName}`,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }));
        setOrders(mockOrders);

        setStats({
          totalMemorials: memorialsData.length,
          activeMemorials,
          pendingMemorials,
          totalLeads: mockLeads.length,
          pendingLeads: mockLeads.filter(l => l.status === "pending").length,
          totalOrders: mockOrders.length,
          newOrders: mockOrders.filter(o => o.productionStatus === "new").length,
          inProductionOrders: mockOrders.filter(o => o.productionStatus === "in_production").length,
          waitingDataOrders: mockOrders.filter(o => o.productionStatus === "waiting_data").length,
          readyOrders: mockOrders.filter(o => o.productionStatus === "ready").length,
          deliveredOrders: mockOrders.filter(o => o.productionStatus === "delivered").length,
          totalFuneralHomes: funeralHomesData.length,
          totalFamilyUsers: familyUsersData.length,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    if (adminSession) {
      loadData();
    }
  }, [adminSession]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    toast.success("Logout realizado com sucesso");
    setLocation("/admin/login");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMemorialName = (memorialId: number) => {
    const memorial = memorials.find(m => m.id === memorialId);
    return memorial?.fullName || "Memorial não encontrado";
  };

  const getFuneralHomeName = (funeralHomeId: number) => {
    const fh = funeralHomes.find(f => f.id === funeralHomeId);
    return fh?.name || "Funerária não encontrada";
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, productionStatus: newStatus, updatedAt: new Date().toISOString() } : o
    ));
    toast.success(`Status atualizado para: ${productionStatusConfig[newStatus]?.label}`);
    setShowOrderDialog(false);
  };

  const updateLeadStatus = (leadId: number, newStatus: string) => {
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: newStatus } : l
    ));
    toast.success(`Lead atualizado para: ${leadStatusConfig[newStatus]?.label}`);
    setShowLeadDialog(false);
  };

  // Filter functions
  const filteredOrders = orders.filter(o => {
    const matchesSearch = getMemorialName(o.memorialId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.productionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMemorials = memorials.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!adminSession) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Fila de Produção", icon: ClipboardList, badge: stats.newOrders + stats.inProductionOrders },
    { id: "leads", label: "Solicitações", icon: UserPlus, badge: stats.pendingLeads },
    { id: "memorials", label: "Memoriais", icon: FileText },
    { id: "funeralhomes", label: "Funerárias", icon: Building2 },
    { id: "families", label: "Famílias", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-40 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white block">{APP_TITLE}</span>
              <span className="text-xs text-slate-400">Painel Admin</span>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-teal-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    activeTab === item.id ? "bg-white/20 text-white" : "bg-teal-600 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {adminSession.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{adminSession.name}</p>
              <p className="text-xs text-slate-400 truncate">{adminSession.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">{APP_TITLE}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-400"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "orders" && "Fila de Produção"}
              {activeTab === "leads" && "Solicitações"}
              {activeTab === "memorials" && "Memoriais"}
              {activeTab === "funeralhomes" && "Funerárias"}
              {activeTab === "families" && "Famílias"}
              {activeTab === "settings" && "Configurações"}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === "dashboard" && "Visão geral do sistema"}
              {activeTab === "orders" && "Gerencie os pedidos em produção"}
              {activeTab === "leads" && "Novas solicitações de contato"}
              {activeTab === "memorials" && "Todos os memoriais do sistema"}
              {activeTab === "funeralhomes" && "Funerárias parceiras"}
              {activeTab === "families" && "Usuários familiares"}
              {activeTab === "settings" && "Configurações do sistema"}
            </p>
          </div>
          
          {activeTab !== "dashboard" && activeTab !== "settings" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setStatusFilter("all")}
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-teal-600" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        +12%
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalMemorials}</p>
                    <p className="text-sm text-slate-500">Total de Memoriais</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {stats.newOrders} novos
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                    <p className="text-sm text-slate-500">Pedidos na Fila</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        {stats.pendingLeads} pendentes
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalLeads}</p>
                    <p className="text-sm text-slate-500">Solicitações</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalFuneralHomes}</p>
                    <p className="text-sm text-slate-500">Funerárias Parceiras</p>
                  </div>
                </div>

                {/* Production Queue Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-slate-900">Fila de Produção</h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                        Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(productionStatusConfig).slice(0, 4).map(([status, config]) => {
                        const count = orders.filter(o => o.productionStatus === status).length;
                        const Icon = config.icon;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                              </div>
                              <span className="text-sm font-medium text-slate-700">{config.label}</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-slate-900">Últimas Solicitações</h3>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("leads")}>
                        Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {leads.slice(0, 4).map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                              <span className="text-teal-700 font-semibold text-sm">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{lead.name}</p>
                              <p className="text-xs text-slate-500">{lead.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${leadStatusConfig[lead.status]?.bgColor} ${leadStatusConfig[lead.status]?.color}`}>
                            {leadStatusConfig[lead.status]?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Memorials */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-900">Memoriais Recentes</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("memorials")}>
                      Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Nome</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Funerária</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Criado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memorials.slice(0, 5).map((memorial) => (
                          <tr key={memorial.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-900">{memorial.fullName}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-slate-600">{getFuneralHomeName(memorial.funeralHomeId)}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                memorial.status === "active" ? "bg-emerald-100 text-emerald-600" :
                                memorial.status === "pending_data" ? "bg-amber-100 text-amber-600" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {memorial.status === "active" ? "Ativo" : 
                                 memorial.status === "pending_data" ? "Pendente" : "Inativo"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-slate-500">{formatDate(memorial.createdAt)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "all" 
                        ? "bg-slate-900 text-white" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Todos ({orders.length})
                  </button>
                  {Object.entries(productionStatusConfig).map(([status, config]) => {
                    const count = orders.filter(o => o.productionStatus === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          statusFilter === status 
                            ? `${config.bgColor} ${config.color}` 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pedido</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Memorial</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Funerária</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Prioridade</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Data</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const statusConfig = productionStatusConfig[order.productionStatus];
                          const prioConfig = priorityConfig[order.priority];
                          const StatusIcon = statusConfig?.icon || Clock;
                          
                          return (
                            <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-4 px-6">
                                <span className="font-mono text-sm text-slate-600">#{order.id.toString().padStart(4, '0')}</span>
                              </td>
                              <td className="py-4 px-6">
                                <p className="font-medium text-slate-900">{getMemorialName(order.memorialId)}</p>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm text-slate-600">{getFuneralHomeName(order.funeralHomeId)}</p>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg ${statusConfig?.bgColor} flex items-center justify-center`}>
                                    <StatusIcon className={`w-4 h-4 ${statusConfig?.color}`} />
                                  </div>
                                  <span className={`text-sm font-medium ${statusConfig?.color}`}>
                                    {statusConfig?.label}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${prioConfig?.bgColor} ${prioConfig?.color}`}>
                                  {prioConfig?.label}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                              </td>
                              <td className="py-4 px-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDialog(true);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Nenhum pedido encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === "leads" && (
              <div className="space-y-6">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "all" 
                        ? "bg-slate-900 text-white" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Todos ({leads.length})
                  </button>
                  {Object.entries(leadStatusConfig).map(([status, config]) => {
                    const count = leads.filter(l => l.status === status).length;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          statusFilter === status 
                            ? `${config.bgColor} ${config.color}` 
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Leads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLeads.map((lead) => {
                    const config = leadStatusConfig[lead.status];
                    return (
                      <div key={lead.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                              <span className="text-teal-700 font-semibold">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{lead.name}</p>
                              <p className="text-sm text-slate-500">{lead.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${config?.bgColor} ${config?.color}`}>
                            {config?.label}
                          </span>
                        </div>
                        
                        {lead.phone && (
                          <p className="text-sm text-slate-600 mb-3">
                            📞 {lead.phone}
                          </p>
                        )}
                        
                        <p className="text-xs text-slate-400 mb-4">
                          Recebido em {formatDateTime(lead.createdAt)}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowLeadDialog(true);
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma solicitação encontrada</p>
                  </div>
                )}
              </div>
            )}

            {/* Memorials Tab */}
            {activeTab === "memorials" && (
              <div className="space-y-6">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "all" 
                        ? "bg-slate-900 text-white" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Todos ({memorials.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("active")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "active" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Ativos ({memorials.filter(m => m.status === "active").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending_data")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "pending_data" 
                        ? "bg-amber-100 text-amber-600" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Pendentes ({memorials.filter(m => m.status === "pending_data").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("inactive")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === "inactive" 
                        ? "bg-slate-200 text-slate-600" 
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Inativos ({memorials.filter(m => m.status === "inactive").length})
                  </button>
                </div>

                {/* Memorials Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Nome</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Funerária</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Nascimento</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Falecimento</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Visibilidade</th>
                          <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMemorials.map((memorial) => (
                          <tr key={memorial.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-4 px-6">
                              <p className="font-medium text-slate-900">{memorial.fullName}</p>
                              <p className="text-xs text-slate-400">{memorial.birthplace}</p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-sm text-slate-600">{getFuneralHomeName(memorial.funeralHomeId)}</p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-sm text-slate-600">{memorial.birthDate || "-"}</p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-sm text-slate-600">{memorial.deathDate || "-"}</p>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                memorial.status === "active" ? "bg-emerald-100 text-emerald-600" :
                                memorial.status === "pending_data" ? "bg-amber-100 text-amber-600" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {memorial.status === "active" ? "Ativo" : 
                                 memorial.status === "pending_data" ? "Pendente" : "Inativo"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                memorial.visibility === "public" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                              }`}>
                                {memorial.visibility === "public" ? "Público" : "Privado"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/m/${memorial.slug}`, '_blank')}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/memorial/edit/${memorial.id}`)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredMemorials.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Nenhum memorial encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Funeral Homes Tab */}
            {activeTab === "funeralhomes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funeralHomes.map((fh) => (
                  <div key={fh.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{fh.name}</p>
                        <p className="text-sm text-slate-500">{fh.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      {fh.phone && <p>📞 {fh.phone}</p>}
                      {fh.address && <p>📍 {fh.address}</p>}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        Memoriais: {memorials.filter(m => m.funeralHomeId === fh.id).length}
                      </p>
                    </div>
                  </div>
                ))}

                {funeralHomes.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma funerária cadastrada</p>
                  </div>
                )}
              </div>
            )}

            {/* Families Tab */}
            {activeTab === "families" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        {user.isActive ? "Ativo" : "Pendente"}
                      </span>
                      <p className="text-xs text-slate-400">
                        Memoriais: {memorials.filter(m => m.familyUserId === user.id).length}
                      </p>
                    </div>
                  </div>
                ))}

                {familyUsers.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhum usuário familiar cadastrado</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-6">Configurações do Sistema</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nome do Sistema
                      </label>
                      <input
                        type="text"
                        value={APP_TITLE}
                        disabled
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-mail do Administrador
                      </label>
                      <input
                        type="email"
                        value={adminSession.email}
                        disabled
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500">
                        Último login: {formatDateTime(adminSession.loginTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Pedido #{selectedOrder?.id.toString().padStart(4, '0')}</DialogTitle>
            <DialogDescription>
              Atualize o status e informações do pedido
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Memorial</p>
                <p className="font-medium text-slate-900">{getMemorialName(selectedOrder.memorialId)}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Funerária</p>
                <p className="font-medium text-slate-900">{getFuneralHomeName(selectedOrder.funeralHomeId)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Alterar Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(productionStatusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                          selectedOrder.productionStatus === status
                            ? `${config.bgColor} ${config.color} border-current`
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Prioridade</p>
                <div className="flex gap-2">
                  {Object.entries(priorityConfig).map(([priority, config]) => (
                    <button
                      key={priority}
                      onClick={() => {
                        setOrders(prev => prev.map(o => 
                          o.id === selectedOrder.id ? { ...o, priority } : o
                        ));
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedOrder.priority === priority
                          ? `${config.bgColor} ${config.color}`
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas Internas
                </label>
                <textarea
                  rows={3}
                  placeholder="Adicione observações sobre este pedido..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  defaultValue={selectedOrder.internalNotes || ""}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Solicitação</DialogTitle>
            <DialogDescription>
              Atualize o status e informações da solicitação
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-700 font-semibold text-xl">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">{selectedLead.name}</p>
                  <p className="text-slate-500">{selectedLead.email}</p>
                  {selectedLead.phone && <p className="text-slate-500">{selectedLead.phone}</p>}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Alterar Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(leadStatusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        selectedLead.status === status
                          ? `${config.bgColor} ${config.color} border-current`
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas
                </label>
                <textarea
                  rows={3}
                  placeholder="Adicione observações sobre esta solicitação..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  defaultValue={selectedLead.notes || ""}
                />
              </div>

              <p className="text-xs text-slate-400">
                Recebido em {formatDateTime(selectedLead.createdAt)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-50">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === item.id ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
