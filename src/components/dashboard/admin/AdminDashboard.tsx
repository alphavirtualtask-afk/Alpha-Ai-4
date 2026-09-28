import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Check,
  X,
  Filter,
  ArrowUpDown,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../../common/Logo';
import { Button } from '../../common/Button';
import { Input, Textarea } from '../../common/Input';
import { Modal } from '../../common/Modal';
import {
  AdminTab,
  ProjectItem,
  ProjectStatus,
  PaymentItem,
  MessageItem,
  NotificationItem,
  UserProfile,
} from '../../../types';
import { useAuth } from '../../../firebase/AuthContext';
import {
  subscribeAllClients,
  updateClientStatus,
  updateUserProjectStatus,
  subscribeUserProjects,
  subscribeUserMessages,
  subscribeUserPayments,
  sendUserMessage,
  createUserPayment,
  markUserMessageRead,
  createUserNotification,
} from '../../../firebase/userDataService';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

interface ClientSubcollections {
  projects: ProjectItem[];
  messages: MessageItem[];
  payments: PaymentItem[];
}

const PROJECT_STATUSES: ProjectStatus[] = [
  'New',
  'Reviewing',
  'Accepted',
  'In Progress',
  'Waiting for Client',
  'Completed',
  'Cancelled',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Real registered clients from Firestore: users collection
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // Map of client subcollections: clientDataMap[uid] = { projects, messages, payments }
  const [clientDataMap, setClientDataMap] = useState<Record<string, ClientSubcollections>>({});

  // Client Details Modal state
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
  const [clientDetailsTab, setClientDetailsTab] = useState<'info' | 'projects' | 'messages' | 'payments'>('info');

  // Client status update state
  const [updatingClientStatus, setUpdatingClientStatus] = useState<string | null>(null);
  const [newClientStatus, setNewClientStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');

  // Project status update in details or projects tab
  const [editingProject, setEditingProject] = useState<{
    clientId: string;
    projectId: string;
    status: ProjectStatus;
    adminNotes: string;
  } | null>(null);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  // Message reply state
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Create payment modal state
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [paymentClientId, setPaymentClientId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('350');
  const [paymentService, setPaymentService] = useState('Data Cleaning & Formatting');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire / Stripe');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Create broadcast notification state
  const [notifTargetClient, setNotifTargetClient] = useState<string>('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'alert'>('info');
  const [notifSentNotice, setNotifSentNotice] = useState<string | null>(null);

  // Search & Filters
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Suspended'>('all');
  const [clientSort, setClientSort] = useState<'newest' | 'oldest'>('newest');

  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');

  const [messageSearch, setMessageSearch] = useState('');
  const [selectedChatClient, setSelectedChatClient] = useState<UserProfile | null>(null);

  // 1. Subscribe to all real registered clients from Firestore
  useEffect(() => {
    setClientsLoading(true);
    const unsubscribe = subscribeAllClients(
      (loadedClients) => {
        setClients(loadedClients);
        setClientsLoading(false);
      },
      (err) => {
        console.error('Failed to load registered clients:', err);
        setClientsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Attach real-time subcollection listeners for every registered client
  useEffect(() => {
    if (clients.length === 0) {
      setClientDataMap({});
      return;
    }

    const unsubscribers: Array<() => void> = [];

    clients.forEach((client) => {
      // Sub collection: users/{uid}/projects
      const unsubProjects = subscribeUserProjects(client.id, (projects) => {
        setClientDataMap((prev) => ({
          ...prev,
          [client.id]: {
            projects,
            messages: prev[client.id]?.messages || [],
            payments: prev[client.id]?.payments || [],
          },
        }));
      });
      unsubscribers.push(unsubProjects);

      // Sub collection: users/{uid}/messages
      const unsubMessages = subscribeUserMessages(client.id, (messages) => {
        setClientDataMap((prev) => ({
          ...prev,
          [client.id]: {
            projects: prev[client.id]?.projects || [],
            messages,
            payments: prev[client.id]?.payments || [],
          },
        }));
      });
      unsubscribers.push(unsubMessages);

      // Sub collection: users/{uid}/payments
      const unsubPayments = subscribeUserPayments(client.id, (payments) => {
        setClientDataMap((prev) => ({
          ...prev,
          [client.id]: {
            projects: prev[client.id]?.projects || [],
            messages: prev[client.id]?.messages || [],
            payments,
          },
        }));
      });
      unsubscribers.push(unsubPayments);
    });

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }, [clients]);

  // Keep selected client in sync with latest data
  useEffect(() => {
    if (selectedClient) {
      const fresh = clients.find((c) => c.id === selectedClient.id);
      if (fresh) setSelectedClient(fresh);
    }
  }, [clients]);

  // Aggregate all projects dynamically across real users
  const allProjects = useMemo(() => {
    const list: Array<ProjectItem & { clientId: string; clientName: string; clientEmail: string }> = [];
    clients.forEach((c) => {
      const userProjects = clientDataMap[c.id]?.projects || [];
      userProjects.forEach((p) => {
        list.push({
          ...p,
          clientId: c.id,
          clientName: c.displayName || p.clientName || 'Unnamed Client',
          clientEmail: c.email || p.clientEmail,
        });
      });
    });
    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clients, clientDataMap]);

  // Aggregate all messages dynamically across real users
  const allMessages = useMemo(() => {
    const list: Array<MessageItem & { clientId: string; clientName: string; clientEmail: string }> = [];
    clients.forEach((c) => {
      const userMessages = clientDataMap[c.id]?.messages || [];
      userMessages.forEach((m) => {
        list.push({
          ...m,
          clientId: c.id,
          clientName: c.displayName || 'Client',
          clientEmail: c.email,
        });
      });
    });
    return list;
  }, [clients, clientDataMap]);

  // Aggregate all payments dynamically across real users
  const allPayments = useMemo(() => {
    const list: Array<PaymentItem & { clientId: string; clientName: string; clientEmail: string }> = [];
    clients.forEach((c) => {
      const userPayments = clientDataMap[c.id]?.payments || [];
      userPayments.forEach((p) => {
        list.push({
          ...p,
          clientId: c.id,
          clientName: c.displayName || p.clientName || 'Client',
          clientEmail: c.email || p.clientEmail || '',
        });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clients, clientDataMap]);

  // Overview real-time metrics computed directly from Firebase data
  const totalClients = clients.length;
  const newClientsCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return clients.filter((c) => new Date(c.createdAt).getTime() >= sevenDaysAgo).length;
  }, [clients]);
  const activeClientsCount = clients.filter(
    (c) => (c.status || c.accountStatus || 'Active') === 'Active'
  ).length;
  const completedProjectsCount = allProjects.filter((p) => p.status === 'Completed').length;
  const pendingProjectsCount = allProjects.filter(
    (p) => p.status !== 'Completed' && p.status !== 'Cancelled'
  ).length;
  const totalProjectsCount = allProjects.length;
  const unreadMessagesCount = allMessages.filter(
    (m) => m.unread && m.senderRole === 'client'
  ).length;

  const totalPaidRevenue = allPayments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalPendingRevenue = allPayments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.displayName?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phoneNumber?.toLowerCase().includes(q) ||
          c.fullPhoneNumber?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
      );
    }

    if (clientStatusFilter !== 'all') {
      result = result.filter(
        (c) => (c.status || c.accountStatus || 'Active') === clientStatusFilter
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return clientSort === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [clients, clientSearch, clientStatusFilter, clientSort]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    let result = [...allProjects];

    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.serviceName?.toLowerCase().includes(q) ||
          p.clientName?.toLowerCase().includes(q) ||
          p.clientEmail?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
    }

    if (projectStatusFilter !== 'all') {
      result = result.filter((p) => p.status === projectStatusFilter);
    }

    return result;
  }, [allProjects, projectSearch, projectStatusFilter]);

  // Handlers
  const handleLogoutClick = async () => {
    await logout();
    onLogout();
  };

  const handleOpenClientDetails = (client: UserProfile) => {
    setSelectedClient(client);
    setNewClientStatus((client.status || client.accountStatus || 'Active') as any);
    setClientDetailsTab('info');
  };

  const handleSaveClientStatus = async () => {
    if (!selectedClient) return;
    setUpdatingClientStatus(selectedClient.id);
    try {
      await updateClientStatus(selectedClient.id, newClientStatus);
      setSelectedClient((prev) =>
        prev ? { ...prev, status: newClientStatus, accountStatus: newClientStatus } : null
      );
    } catch (err) {
      console.error('Failed to update client status:', err);
    } finally {
      setUpdatingClientStatus(null);
    }
  };

  const handleSaveProjectStatus = async () => {
    if (!editingProject) return;
    setIsUpdatingProject(true);
    try {
      await updateUserProjectStatus(
        editingProject.clientId,
        editingProject.projectId,
        editingProject.status,
        editingProject.adminNotes
      );
      setEditingProject(null);
    } catch (err) {
      console.error('Failed to update project status in Firebase:', err);
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleSendReply = async (clientId: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await sendUserMessage(clientId, replyText.trim(), 'Alpha Operations Admin', 'admin');
      setReplyText('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCreatePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentClientId || !paymentAmount) return;

    setIsCreatingPayment(true);
    try {
      const client = clients.find((c) => c.id === paymentClientId);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await createUserPayment(paymentClientId, {
        invoiceNumber,
        clientName: client?.displayName || 'Client',
        serviceName: paymentService,
        amount: Number(paymentAmount) || 0,
        status: paymentStatus,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        transactionId: `TX-${Date.now().toString(36).toUpperCase()}`,
      });

      setShowCreatePaymentModal(false);
      setPaymentAmount('350');
    } catch (err) {
      console.error('Failed to create payment:', err);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    try {
      if (notifTargetClient === 'all') {
        await Promise.all(
          clients.map((c) =>
            createUserNotification(c.id, {
              title: notifTitle.trim(),
              message: notifMessage.trim(),
              type: notifType,
            })
          )
        );
      } else {
        await createUserNotification(notifTargetClient, {
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          type: notifType,
        });
      }

      setNotifSentNotice('Notification dispatched successfully to Firebase!');
      setNotifTitle('');
      setNotifMessage('');
      setTimeout(() => setNotifSentNotice(null), 3000);
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Active':
      case 'Completed':
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
      case 'Accepted':
        return 'bg-[#E5A93C]/10 text-[#E5A93C] border-[#E5A93C]/20';
      case 'Reviewing':
      case 'Waiting for Client':
      case 'Pending':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'New':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Suspended':
      case 'Cancelled':
      case 'Overdue':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#E5A93C] selection:text-black">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-full lg:w-64 bg-[#0C0F16] border-r border-[#1B2130] flex flex-col shrink-0">
        {/* Brand Lockup */}
        <div className="p-4 border-b border-[#1B2130] flex items-center justify-between">
          <Logo size="sm" showTagline={false} onClick={onNavigateHome} />
          <span className="text-[10px] font-mono font-bold bg-[#E5A93C]/10 text-[#E5A93C] px-2 py-0.5 rounded border border-[#E5A93C]/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            ADMIN CRM
          </span>
        </div>

        {/* Admin Authorized Profile */}
        <div className="p-3.5 mx-3 my-3 bg-[#121622] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] font-bold text-xs">
            AVT
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-bold text-white truncate">Operations Director</div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{user?.email || 'alphavirtualtask@gmail.com'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'clients' ? 'bg-black/20 text-black font-bold' : 'bg-[#182030] text-[#E5A93C]'
              }`}
            >
              {totalClients}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4" />
              <span>Projects</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'projects' ? 'bg-black/20 text-black font-bold' : 'bg-[#182030] text-slate-300'
              }`}
            >
              {totalProjectsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'payments' ? 'bg-black/20 text-black font-bold' : 'bg-[#182030] text-emerald-400'
              }`}
            >
              ${totalPaidRevenue}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#E5A93C] text-black font-bold shadow-lg shadow-[#E5A93C]/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-[#1B2130]">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Admin OS</span>
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#0C0F16] border-b border-[#1B2130] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Admin CRM /</span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#E5A93C] font-bold">
              {activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#121622] rounded-lg border border-white/5 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Firebase Database</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreatePaymentModal(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Issue Invoice
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 space-y-6">
          {/* ========================================================
              TAB 1: OVERVIEW (Real-time Firebase Statistics)
             ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 7 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Clients</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-white">{totalClients}</div>
                  <div className="mt-1 text-[10px] text-emerald-400">Registered users</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New Clients</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-[#E5A93C]">{newClientsCount}</div>
                  <div className="mt-1 text-[10px] text-slate-400">Last 7 days</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Clients</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{activeClientsCount}</div>
                  <div className="mt-1 text-[10px] text-emerald-500/80">Active accounts</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Projects</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-white">{totalProjectsCount}</div>
                  <div className="mt-1 text-[10px] text-slate-400">All submissions</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Projects</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{pendingProjectsCount}</div>
                  <div className="mt-1 text-[10px] text-amber-500/80">In Progress / Review</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Projects</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{completedProjectsCount}</div>
                  <div className="mt-1 text-[10px] text-emerald-500/80">100% Delivered</div>
                </div>

                <div className="bg-[#10141D] p-4 rounded-xl border border-[#202738] flex flex-col justify-between col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Unread Messages</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-sky-400">{unreadMessagesCount}</div>
                  <div className="mt-1 text-[10px] text-sky-500/80">From registered clients</div>
                </div>
              </div>

              {/* Financial Quick Summary Bar */}
              <div className="p-4 rounded-xl bg-[#10141D] border border-[#202738] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Total Collected Payments</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">${totalPaidRevenue.toLocaleString()}</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-400">Pending Receivables</div>
                    <div className="text-xl font-bold font-mono text-amber-400">${totalPendingRevenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  Data synchronized directly with <span className="font-mono text-[#E5A93C]">users/{'{uid}'}</span> Firestore subcollections.
                </div>
              </div>

              {/* Two Column Layout: Recent Registered Clients & Recent Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Registered Clients */}
                <div className="bg-[#10141D] rounded-2xl border border-[#202738] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#E5A93C]" />
                      <span>Recent Registered Clients</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className="text-xs text-[#E5A93C] hover:underline cursor-pointer"
                    >
                      View All Clients →
                    </button>
                  </div>

                  {clients.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No client accounts registered yet in Firebase.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {clients.slice(0, 5).map((client) => {
                        const clientProjects = clientDataMap[client.id]?.projects || [];
                        const clientStatus = client.status || client.accountStatus || 'Active';
                        return (
                          <div
                            key={client.id}
                            onClick={() => handleOpenClientDetails(client)}
                            className="p-3 rounded-xl bg-[#141926] border border-white/5 hover:border-[#E5A93C]/40 transition-all flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1A2234] border border-[#2B354A] flex items-center justify-center font-bold text-xs text-[#E5A93C]">
                                {client.displayName?.slice(0, 2).toUpperCase() || 'CL'}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white group-hover:text-[#E5A93C] transition-colors">
                                  {client.displayName || 'Client User'}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-400">
                                {clientProjects.length} {clientProjects.length === 1 ? 'project' : 'projects'}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(clientStatus)}`}>
                                {clientStatus}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Client Projects */}
                <div className="bg-[#10141D] rounded-2xl border border-[#202738] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#E5A93C]" />
                      <span>Recent Client Projects</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-[#E5A93C] hover:underline cursor-pointer"
                    >
                      View All Projects →
                    </button>
                  </div>

                  {allProjects.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No client projects submitted yet. Clients can create projects from their workspace.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {allProjects.slice(0, 5).map((project) => (
                        <div
                          key={`${project.clientId}-${project.id}`}
                          className="p-3 rounded-xl bg-[#141926] border border-white/5 flex items-center justify-between"
                        >
                          <div className="overflow-hidden pr-3">
                            <div className="text-xs font-bold text-white truncate">{project.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              Client: {project.clientName} · {project.serviceName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CLIENTS (Registered Clients Directory)
             ======================================================== */}
          {activeTab === 'clients' && (
            <div className="space-y-5">
              {/* Controls bar */}
              <div className="p-4 rounded-2xl bg-[#10141D] border border-[#202738] flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-[#161B26] border border-[#252F42] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Filter className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <span>Status:</span>
                    <select
                      value={clientStatusFilter}
                      onChange={(e) => setClientStatusFilter(e.target.value as any)}
                      className="bg-[#161B26] border border-[#252F42] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
                    >
                      <option value="all">All ({clients.length})</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#E5A93C]" />
                    <select
                      value={clientSort}
                      onChange={(e) => setClientSort(e.target.value as any)}
                      className="bg-[#161B26] border border-[#252F42] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Real Clients Table */}
              <div className="bg-[#10141D] rounded-2xl border border-[#202738] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0C0F16] border-b border-[#202738] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Client</th>
                        <th className="py-3.5 px-4 font-semibold">Phone</th>
                        <th className="py-3.5 px-4 font-semibold">Email</th>
                        <th className="py-3.5 px-4 font-semibold">Projects</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold">Joined</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2234]">
                      {clientsLoading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            Loading registered clients from Firebase...
                          </td>
                        </tr>
                      ) : filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No registered clients match the current criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((client) => {
                          const clientProjects = clientDataMap[client.id]?.projects || [];
                          const latestProject = clientProjects[0];
                          const clientStatus = client.status || client.accountStatus || 'Active';
                          const displayPhone =
                            client.fullPhoneNumber ||
                            (client.countryCode && client.phoneNumber
                              ? `${client.countryCode} ${client.phoneNumber}`
                              : client.phoneNumber || 'Not provided');
                          const joinedDate = client.createdAt ? client.createdAt.split('T')[0] : 'N/A';

                          return (
                            <tr key={client.id} className="hover:bg-[#141926] transition-colors">
                              {/* Client Column */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1A2234] border border-[#2B354A] flex items-center justify-center font-bold text-xs text-[#E5A93C]">
                                    {client.displayName?.slice(0, 2).toUpperCase() || 'CL'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{client.displayName || 'Client User'}</div>
                                    {client.company && (
                                      <div className="text-[10px] text-slate-400">{client.company}</div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Phone Column */}
                              <td className="py-3.5 px-4 font-mono text-slate-300">
                                {displayPhone}
                              </td>

                              {/* Email Column */}
                              <td className="py-3.5 px-4 font-mono text-slate-300">
                                {client.email}
                              </td>

                              {/* Projects Column */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white bg-[#1A2234] px-2 py-0.5 rounded text-[11px]">
                                    {clientProjects.length}
                                  </span>
                                  {latestProject && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(latestProject.status)} truncate max-w-[120px]`}>
                                      {latestProject.status}
                                    </span>
                                  )}
                                </div>
                                {latestProject && (
                                  <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                    {latestProject.title}
                                  </div>
                                )}
                              </td>

                              {/* Status Column */}
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(clientStatus)}`}>
                                  {clientStatus}
                                </span>
                              </td>

                              {/* Joined Column */}
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                                {joinedDate}
                              </td>

                              {/* Action Column */}
                              <td className="py-3.5 px-4 text-right">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenClientDetails(client)}
                                  icon={<Eye className="w-3.5 h-3.5" />}
                                  className="text-xs"
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: PROJECTS (Dedicated Project Management)
             ======================================================== */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              {/* Controls bar */}
              <div className="p-4 rounded-2xl bg-[#10141D] border border-[#202738] flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects, client, service..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full bg-[#161B26] border border-[#252F42] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A93C]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>Status Filter:</span>
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="bg-[#161B26] border border-[#252F42] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
                  >
                    <option value="all">All Projects ({allProjects.length})</option>
                    {PROJECT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Projects Table */}
              <div className="bg-[#10141D] rounded-2xl border border-[#202738] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0C0F16] border-b border-[#202738] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Project Title</th>
                        <th className="py-3.5 px-4 font-semibold">Client</th>
                        <th className="py-3.5 px-4 font-semibold">Service</th>
                        <th className="py-3.5 px-4 font-semibold">Budget</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold">Submitted</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2234]">
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No projects found matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((proj) => (
                          <tr key={`${proj.clientId}-${proj.id}`} className="hover:bg-[#141926] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{proj.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{proj.id}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{proj.clientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{proj.clientEmail}</div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-300">
                              {proj.serviceName}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-[#E5A93C]">
                              ${proj.budget}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(proj.status)}`}>
                                {proj.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                              {proj.createdAt}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setEditingProject({
                                    clientId: proj.clientId,
                                    projectId: proj.id,
                                    status: proj.status,
                                    adminNotes: proj.adminNotes || proj.notes || '',
                                  })
                                }
                                className="text-xs"
                              >
                                Edit Status
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: MESSAGES (Real Client Inquiries)
             ======================================================== */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
              {/* Clients with Messages List */}
              <div className="lg:col-span-4 bg-[#10141D] rounded-2xl border border-[#202738] p-4 flex flex-col">
                <div className="pb-3 border-b border-[#202738] mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
                    <span>Client Conversations</span>
                    <span className="text-[10px] font-mono text-[#E5A93C] bg-[#E5A93C]/10 px-2 py-0.5 rounded">
                      {clients.length} Clients
                    </span>
                  </h3>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px]">
                  {clients.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No client messages.</div>
                  ) : (
                    clients.map((c) => {
                      const clientMsgs = clientDataMap[c.id]?.messages || [];
                      const unread = clientMsgs.filter((m) => m.unread && m.senderRole === 'client').length;
                      const lastMsg = clientMsgs[clientMsgs.length - 1];
                      const isSelected = selectedChatClient?.id === c.id;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedChatClient(c)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#182030] border-[#E5A93C] text-white'
                              : 'bg-[#141926] border-white/5 hover:border-white/20 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white truncate">{c.displayName || 'Client'}</span>
                            {unread > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                                {unread} new
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {lastMsg ? lastMsg.text : 'No messages sent yet'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Thread Panel */}
              <div className="lg:col-span-8 bg-[#10141D] rounded-2xl border border-[#202738] flex flex-col justify-between p-5">
                {selectedChatClient ? (
                  <>
                    <div className="pb-4 border-b border-[#202738] flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedChatClient.displayName || 'Client'}</h4>
                        <div className="text-xs text-slate-400 font-mono">{selectedChatClient.email}</div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenClientDetails(selectedChatClient)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Client Profile
                      </Button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 my-4 space-y-3 overflow-y-auto max-h-[380px] p-2">
                      {(clientDataMap[selectedChatClient.id]?.messages || []).length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500">
                          No messages in this client thread yet. You can send the first direct message below.
                        </div>
                      ) : (
                        (clientDataMap[selectedChatClient.id]?.messages || []).map((msg) => {
                          const isFromAdmin = msg.senderRole === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isFromAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[10px] text-slate-400 mb-1 font-mono">
                                {isFromAdmin ? 'Operations Admin' : selectedChatClient.displayName} · {msg.timestamp}
                              </div>
                              <div
                                className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                                  isFromAdmin
                                    ? 'bg-[#E5A93C] text-black font-medium'
                                    : 'bg-[#182030] text-slate-100 border border-white/10'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply Input Form */}
                    <div className="pt-3 border-t border-[#202738] flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Reply directly to ${selectedChatClient.displayName || 'client'}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply(selectedChatClient.id)}
                        className="flex-1 bg-[#161B26] border border-[#252F42] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A93C]"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendReply(selectedChatClient.id)}
                        isLoading={isSendingReply}
                        icon={<Send className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Send
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-16">
                    <MessageSquare className="w-10 h-10 mb-2 text-slate-600" />
                    <p className="text-xs">Select a registered client on the left to review or reply to messages.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: PAYMENTS (Real Transactions & Invoices)
             ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#10141D] border border-[#202738] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Client Payment Ledger</h3>
                  <p className="text-xs text-slate-400">All invoices and payment records across client workspaces</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreatePaymentModal(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Create New Invoice
                </Button>
              </div>

              <div className="bg-[#10141D] rounded-2xl border border-[#202738] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0C0F16] border-b border-[#202738] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Invoice #</th>
                        <th className="py-3.5 px-4 font-semibold">Client</th>
                        <th className="py-3.5 px-4 font-semibold">Service Description</th>
                        <th className="py-3.5 px-4 font-semibold">Amount</th>
                        <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A2234]">
                      {allPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No payment records recorded in database yet. Click "Create New Invoice" to bill a client.
                          </td>
                        </tr>
                      ) : (
                        allPayments.map((pay) => (
                          <tr key={`${pay.clientId}-${pay.id}`} className="hover:bg-[#141926] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              {pay.invoiceNumber}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{pay.clientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{pay.clientEmail}</div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-300">
                              {pay.serviceName}
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-[#E5A93C]">
                              ${pay.amount}
                            </td>

                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                              {pay.paymentMethod}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(pay.status)}`}>
                                {pay.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                              {pay.date}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: NOTIFICATIONS (System Broadcasts)
             ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl bg-[#10141D] rounded-2xl border border-[#202738] p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#E5A93C]" />
                  <span>Broadcast System Notification</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dispatch notifications directly to a client's workspace notification center.
                </p>
              </div>

              {notifSentNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{notifSentNotice}</span>
                </div>
              )}

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Client</label>
                  <select
                    value={notifTargetClient}
                    onChange={(e) => setNotifTargetClient(e.target.value)}
                    className="w-full bg-[#161B26] border border-[#252F42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
                  >
                    <option value="all">All Registered Clients ({clients.length})</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName || 'Client'} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Notification Title"
                  placeholder="e.g. Schedule Update or Maintenance Notice"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                />

                <Textarea
                  label="Notification Message"
                  placeholder="Enter the broadcast message for the client..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={4}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Level</label>
                  <div className="flex items-center gap-3">
                    {(['info', 'success', 'alert'] as const).map((lvl) => (
                      <label key={lvl} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="notifType"
                          value={lvl}
                          checked={notifType === lvl}
                          onChange={() => setNotifType(lvl)}
                          className="accent-[#E5A93C]"
                        />
                        <span className="capitalize">{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    icon={<Send className="w-4 h-4" />}
                    className="w-full font-bold"
                  >
                    Dispatch Notification to Firebase
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================
              TAB 7: SETTINGS (Admin System Info)
             ======================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-[#10141D] rounded-2xl border border-[#202738] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
                  <span>Administrative Security & Environment</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141926] border border-white/5">
                    <span className="text-slate-400">Authenticated Admin Email</span>
                    <span className="font-mono text-[#E5A93C] font-bold">alphavirtualtask@gmail.com</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141926] border border-white/5">
                    <span className="text-slate-400">Firebase Firestore Database</span>
                    <span className="font-mono text-emerald-400 font-bold">ai-studio-alphavirtualtask-14895bc5</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141926] border border-white/5">
                    <span className="text-slate-400">Data Architecture Scoping</span>
                    <span className="font-mono text-slate-300">users/{'{uid}'} Subcollection Isolation</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141926] border border-white/5">
                    <span className="text-slate-400">Role-Based Access Control (RBAC)</span>
                    <span className="text-emerald-400 font-bold">Enforced via firestore.rules</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: CLIENT FULL DETAILS (Client Profile, Projects, Messages, Payments)
         ======================================================== */}
      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={`Client Profile: ${selectedClient.displayName || 'Client'}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="p-4 rounded-xl bg-[#161B26] border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1D2536] border border-[#2F3A52] flex items-center justify-center font-bold text-base text-[#E5A93C]">
                  {selectedClient.displayName?.slice(0, 2).toUpperCase() || 'CL'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedClient.displayName || 'Client User'}</h3>
                  <div className="text-xs text-slate-400 font-mono">{selectedClient.email}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {selectedClient.id}</div>
                </div>
              </div>

              {/* Account Status Switcher */}
              <div className="flex items-center gap-2 bg-[#0E121A] p-2 rounded-xl border border-white/10">
                <span className="text-xs text-slate-400">Account Status:</span>
                <select
                  value={newClientStatus}
                  onChange={(e) => setNewClientStatus(e.target.value as any)}
                  className="bg-[#1A2232] border border-[#2C3850] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveClientStatus}
                  isLoading={updatingClientStatus === selectedClient.id}
                  className="text-xs"
                >
                  Save Status
                </Button>
              </div>
            </div>

            {/* Sub-tabs inside Client Details */}
            <div className="flex items-center gap-2 border-b border-[#222A3B] pb-2">
              <button
                onClick={() => setClientDetailsTab('info')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  clientDetailsTab === 'info' ? 'bg-[#E5A93C] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Client Information
              </button>
              <button
                onClick={() => setClientDetailsTab('projects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  clientDetailsTab === 'projects' ? 'bg-[#E5A93C] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Projects ({clientDataMap[selectedClient.id]?.projects?.length || 0})
              </button>
              <button
                onClick={() => setClientDetailsTab('messages')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  clientDetailsTab === 'messages' ? 'bg-[#E5A93C] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Messages ({clientDataMap[selectedClient.id]?.messages?.length || 0})
              </button>
              <button
                onClick={() => setClientDetailsTab('payments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  clientDetailsTab === 'payments' ? 'bg-[#E5A93C] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Payments ({clientDataMap[selectedClient.id]?.payments?.length || 0})
              </button>
            </div>

            {/* 1. Client Info Tab */}
            {clientDetailsTab === 'info' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Full Name</span>
                  <div className="font-bold text-white text-sm">{selectedClient.displayName || 'Client User'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Gmail / Email</span>
                  <div className="font-bold text-white font-mono text-sm">{selectedClient.email}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Phone Number</span>
                  <div className="font-bold text-white font-mono text-sm">
                    {selectedClient.fullPhoneNumber ||
                      (selectedClient.countryCode && selectedClient.phoneNumber
                        ? `${selectedClient.countryCode} ${selectedClient.phoneNumber}`
                        : selectedClient.phoneNumber || 'Not provided')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Country ISO Code</span>
                  <div className="font-bold text-white font-mono text-sm">
                    {selectedClient.countryIso || selectedClient.countryCode || 'Global'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Company / Organization</span>
                  <div className="font-bold text-white text-sm">{selectedClient.company || 'Personal Workspace'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141926] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Registration Date</span>
                  <div className="font-bold text-white font-mono text-sm">
                    {selectedClient.createdAt ? selectedClient.createdAt.split('T')[0] : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Client Projects Tab */}
            {clientDetailsTab === 'projects' && (
              <div className="space-y-3">
                {(clientDataMap[selectedClient.id]?.projects || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    This client has not created any projects yet.
                  </div>
                ) : (
                  (clientDataMap[selectedClient.id]?.projects || []).map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#141926] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#E5A93C] font-bold">{p.id}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{p.title}</h4>
                        <div className="text-xs text-slate-400 font-mono">
                          Service: {p.serviceName} · Deadline: {p.deadline} · Budget: ${p.budget}
                        </div>
                        {p.adminNotes && (
                          <div className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-2">
                            <span className="font-bold">Admin Note:</span> {p.adminNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setEditingProject({
                              clientId: selectedClient.id,
                              projectId: p.id,
                              status: p.status,
                              adminNotes: p.adminNotes || p.notes || '',
                            })
                          }
                          className="text-xs shrink-0"
                        >
                          Change Status
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Client Messages Tab */}
            {clientDetailsTab === 'messages' && (
              <div className="space-y-4">
                <div className="max-h-72 overflow-y-auto space-y-2 p-2">
                  {(clientDataMap[selectedClient.id]?.messages || []).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No messages from this client.</div>
                  ) : (
                    (clientDataMap[selectedClient.id]?.messages || []).map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs ${
                          m.senderRole === 'admin'
                            ? 'bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-white ml-6'
                            : 'bg-[#182030] border border-white/5 text-slate-200 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                          <span className="font-bold text-[#E5A93C]">{m.senderRole === 'admin' ? 'Operations Admin' : selectedClient.displayName}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-[#202738] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Reply directly to ${selectedClient.displayName || 'client'}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply(selectedClient.id)}
                    className="flex-1 bg-[#161B26] border border-[#252F42] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A93C]"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendReply(selectedClient.id)}
                    isLoading={isSendingReply}
                    icon={<Send className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Client Payments Tab */}
            {clientDetailsTab === 'payments' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setPaymentClientId(selectedClient.id);
                      setShowCreatePaymentModal(true);
                    }}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Issue Invoice for this Client
                  </Button>
                </div>

                {(clientDataMap[selectedClient.id]?.payments || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No payment records found for this client.
                  </div>
                ) : (
                  (clientDataMap[selectedClient.id]?.payments || []).map((pay) => (
                    <div
                      key={pay.id}
                      className="p-3.5 rounded-xl bg-[#141926] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-white">{pay.invoiceNumber}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{pay.serviceName} · {pay.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#E5A93C] text-sm">${pay.amount}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(pay.status)}`}>
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: EDIT PROJECT STATUS & ADMIN NOTES
         ======================================================== */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title={`Update Project Status (${editingProject.projectId})`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Status</label>
              <select
                value={editingProject.status}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    status: e.target.value as ProjectStatus,
                  })
                }
                className="w-full bg-[#161B26] border border-[#252F42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Admin Notes / Progress Feedback (Visible to Client)"
              placeholder="e.g. Initial data set extracted, now running deduplication QA."
              value={editingProject.adminNotes}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  adminNotes: e.target.value,
                })
              }
              rows={3}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveProjectStatus}
                isLoading={isUpdatingProject}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Save & Sync to Firebase
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: CREATE PAYMENT / INVOICE
         ======================================================== */}
      {showCreatePaymentModal && (
        <Modal
          isOpen={showCreatePaymentModal}
          onClose={() => setShowCreatePaymentModal(false)}
          title="Issue New Client Invoice / Payment"
          maxWidth="md"
        >
          <form onSubmit={handleCreatePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Client</label>
              <select
                value={paymentClientId}
                onChange={(e) => setPaymentClientId(e.target.value)}
                required
                className="w-full bg-[#161B26] border border-[#252F42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="">-- Choose Registered Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName || 'Client'} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Service Description"
              value={paymentService}
              onChange={(e) => setPaymentService(e.target.value)}
              required
            />

            <Input
              label="Amount ($ USD)"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-[#161B26] border border-[#252F42] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <Input
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowCreatePaymentModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isCreatingPayment}
                icon={<CreditCard className="w-3.5 h-3.5" />}
              >
                Save Invoice to Firebase
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
