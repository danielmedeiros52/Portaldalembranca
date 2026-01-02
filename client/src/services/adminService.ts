/**
 * Admin Service Layer
 * 
 * This service handles admin authentication and session management.
 * It uses localStorage for session persistence.
 */

export interface AdminSession {
  id: number;
  name: string;
  email: string;
  type: string;
  isDemo: boolean;
  loginTime: string;
}

export interface AdminStats {
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

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  notes?: string;
  acceptEmails: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  memorialId: number;
  funeralHomeId: number;
  familyUserId?: number;
  productionStatus: 'new' | 'in_production' | 'waiting_data' | 'ready' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  internalNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistory {
  id: number;
  orderId: number;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  notes?: string;
  createdAt: string;
}

const ADMIN_SESSION_KEY = 'adminSession';

class AdminService {
  // Session Management
  getSession(): AdminSession | null {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  setSession(session: AdminSession): void {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    
    // Check if session is expired (24 hours)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  // Authentication is now handled via tRPC in AdminLoginPage
  // This method is kept for compatibility but should not be used directly
  async login(email: string, password: string): Promise<AdminSession> {
    throw new Error('Use tRPC admin.login mutation instead');
  }

  logout(): void {
    this.clearSession();
  }

  // Production Status Labels
  getProductionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      new: 'Novo',
      in_production: 'Em Produção',
      waiting_data: 'Aguardando Dados',
      ready: 'Pronto',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }

  getProductionStatusColor(status: string): { text: string; bg: string } {
    const colors: Record<string, { text: string; bg: string }> = {
      new: { text: 'text-blue-600', bg: 'bg-blue-100' },
      in_production: { text: 'text-amber-600', bg: 'bg-amber-100' },
      waiting_data: { text: 'text-orange-600', bg: 'bg-orange-100' },
      ready: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
      delivered: { text: 'text-green-600', bg: 'bg-green-100' },
      cancelled: { text: 'text-red-600', bg: 'bg-red-100' },
    };
    return colors[status] || { text: 'text-slate-600', bg: 'bg-slate-100' };
  }

  // Priority Labels
  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return labels[priority] || priority;
  }

  getPriorityColor(priority: string): { text: string; bg: string } {
    const colors: Record<string, { text: string; bg: string }> = {
      low: { text: 'text-slate-600', bg: 'bg-slate-100' },
      normal: { text: 'text-blue-600', bg: 'bg-blue-100' },
      high: { text: 'text-amber-600', bg: 'bg-amber-100' },
      urgent: { text: 'text-red-600', bg: 'bg-red-100' },
    };
    return colors[priority] || { text: 'text-slate-600', bg: 'bg-slate-100' };
  }

  // Lead Status Labels
  getLeadStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      contacted: 'Contatado',
      converted: 'Convertido',
      rejected: 'Rejeitado',
    };
    return labels[status] || status;
  }

  getLeadStatusColor(status: string): { text: string; bg: string } {
    const colors: Record<string, { text: string; bg: string }> = {
      pending: { text: 'text-amber-600', bg: 'bg-amber-100' },
      contacted: { text: 'text-blue-600', bg: 'bg-blue-100' },
      converted: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
      rejected: { text: 'text-red-600', bg: 'bg-red-100' },
    };
    return colors[status] || { text: 'text-slate-600', bg: 'bg-slate-100' };
  }

  // Memorial Status Labels
  getMemorialStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativo',
      pending_data: 'Pendente',
      inactive: 'Inativo',
    };
    return labels[status] || status;
  }

  getMemorialStatusColor(status: string): { text: string; bg: string } {
    const colors: Record<string, { text: string; bg: string }> = {
      active: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
      pending_data: { text: 'text-amber-600', bg: 'bg-amber-100' },
      inactive: { text: 'text-slate-600', bg: 'bg-slate-100' },
    };
    return colors[status] || { text: 'text-slate-600', bg: 'bg-slate-100' };
  }

  // Date Formatting
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays} dias`;
    return this.formatDate(dateStr);
  }
}

// Export singleton instance
export const adminService = new AdminService();

// Export default for convenience
export default adminService;
