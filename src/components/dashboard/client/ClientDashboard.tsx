import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Plus,
  FileText,
  CreditCard,
  MessageSquare,
  FolderDown,
  Star,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Download,
  Send,
  Eye,
  Check,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../../common/Logo';
import { Button } from '../../common/Button';
import { Input, Textarea } from '../../common/Input';
import { Modal } from '../../common/Modal';
import { SERVICES_DATA } from '../../../data/mockData';
import {
  ClientTab,
  ProjectItem,
  ServiceRequestItem,
  QuotationItem,
  PaymentItem,
  MessageItem,
  NotificationItem,
} from '../../../types';
import { useAuth } from '../../../firebase/AuthContext';
import {
  subscribeUserProjects,
  createUserProject,
  subscribeUserRequests,
  createUserRequest,
  subscribeUserQuotations,
  updateUserQuotationStatus,
  subscribeUserPayments,
  updateUserPaymentStatus,
  subscribeUserMessages,
  sendUserMessage,
  subscribeUserNotifications,
  markAllNotificationsRead,
} from '../../../firebase/userDataService';

interface ClientDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onLogout,
  onNavigateHome,
}) => {
  const { user, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');

  // Isolated user data states - starts 100% empty for new accounts
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI Sub-States
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  // Create Project Modal State
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectService, setNewProjectService] = useState('Data Cleaning');
  const [newProjectDeadline, setNewProjectDeadline] = useState('2025-05-15');
  const [newProjectBudget, setNewProjectBudget] = useState('350');
  const [newProjectNotes, setNewProjectNotes] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // New Request Form State
  const [reqService, setReqService] = useState('Data Cleaning');
  const [reqRequirements, setReqRequirements] = useState('');
  const [reqBudget, setReqBudget] = useState('$500 - $1,000');
  const [reqDeadline, setReqDeadline] = useState('2025-04-15');
  const [reqSubmittedSuccess, setReqSubmittedSuccess] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Client info derived from Firebase auth profile
  const clientName =
    userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Client User';
  const clientEmail = userProfile?.email || user?.email || 'client@alphavirtualtask.com';
  const clientCompany = userProfile?.company || '';
  const clientPhone =
    userProfile?.fullPhoneNumber ||
    (userProfile?.countryCode && userProfile?.phoneNumber
      ? `${userProfile.countryCode} ${userProfile.phoneNumber}`
      : userProfile?.phoneNumber || '');

  const clientUser = {
    name: clientName,
    email: clientEmail,
    company: clientCompany || 'Personal Workspace',
    phone: clientPhone,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      clientName
    )}&backgroundColor=1A202C&textColor=F5B942`,
  };

  // Sync real-time user-isolated collections from Firestore
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setRequests([]);
      setQuotations([]);
      setPayments([]);
      setMessages([]);
      setNotifications([]);
      return;
    }

    const unsubProjects = subscribeUserProjects(user.uid, setProjects);
    const unsubRequests = subscribeUserRequests(user.uid, setRequests);
    const unsubQuotes = subscribeUserQuotations(user.uid, setQuotations);
    const unsubPayments = subscribeUserPayments(user.uid, setPayments);
    const unsubMessages = subscribeUserMessages(user.uid, setMessages);
    const unsubNotifs = subscribeUserNotifications(user.uid, setNotifications);

    return () => {
      unsubProjects();
      unsubRequests();
      unsubQuotes();
      unsubPayments();
      unsubMessages();
      unsubNotifs();
    };
  }, [user]);

  // Derived metrics
  const activeProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'New' || r.status === 'Quote Sent'
  ).length;
  const pendingPaymentsCount = payments.filter((p) => p.status === 'Pending').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !user) return;

    setIsCreatingProject(true);
    try {
      const selectedService = SERVICES_DATA.find((s) => s.name === newProjectService);
      await createUserProject(user.uid, {
        title: newProjectTitle.trim(),
        serviceId: selectedService?.id || 'custom-task',
        serviceName: newProjectService,
        deadline: newProjectDeadline,
        clientName: clientUser.name,
        clientEmail: clientUser.email,
        budget: Number(newProjectBudget) || 250,
        notes: newProjectNotes.trim() || undefined,
      });

      setShowCreateProjectModal(false);
      setNewProjectTitle('');
      setNewProjectNotes('');
      setActiveTab('projects');
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleApproveQuote = async (quoteId: string) => {
    if (!user) return;
    await updateUserQuotationStatus(user.uid, quoteId, 'Approved');
  };

  const handleSimulatePayment = async (paymentId: string) => {
    if (!user) return;
    await updateUserPaymentStatus(user.uid, paymentId, 'Paid');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user) return;

    const text = newMessageText.trim();
    setNewMessageText('');
    await sendUserMessage(user.uid, text, clientUser.name, 'client');
  };

  const handleSubmitServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqRequirements.trim() || !user) return;

    setIsSubmittingRequest(true);
    try {
      await createUserRequest(user.uid, {
        clientName: clientUser.name,
        email: clientUser.email,
        phone: clientUser.phone,
        serviceName: reqService,
        requirements: reqRequirements,
        budgetEstimate: reqBudget,
        deadline: reqDeadline,
      });

      setReqSubmittedSuccess(true);
      setTimeout(() => {
        setReqSubmittedSuccess(false);
        setReqRequirements('');
        setActiveTab('overview');
      }, 1500);
    } catch (err) {
      console.error('Error submitting request:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-full lg:w-64 bg-[#10141D] border-r border-[#1F2636] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1F2636] flex items-center justify-between">
          <Logo size="sm" showTagline={false} onClick={onNavigateHome} />
          <button
            onClick={onNavigateHome}
            title="Public Homepage"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Profile Snippet */}
        <div className="p-4 mx-3 my-3 bg-[#151B27] rounded-xl border border-white/5 flex items-center gap-3">
          <img
            src={clientUser.avatar}
            alt={clientUser.name}
            className="w-10 h-10 rounded-full border border-[#E5A93C]/40 bg-[#1A202E]"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{clientUser.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{clientUser.email}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>My Projects</span>
            </div>
            {projects.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10">
                {projects.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'request'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>New Request</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'quotations'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Quotations</span>
            </div>
            {quotations.filter((q) => q.status === 'Sent').length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#E5A93C] text-black font-bold">
                {quotations.filter((q) => q.status === 'Sent').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payments</span>
            </div>
            {pendingPaymentsCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-bold">
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Messages</span>
            </div>
            {messages.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderDown className="w-4 h-4 shrink-0" />
            <span>Files & Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="w-4 h-4 shrink-0" />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#E5A93C] text-black font-bold shadow-md shadow-[#E5A93C]/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Profile & Settings</span>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#1F2636] space-y-1">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#10141D] border-b border-[#1F2636] px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Client Portal / <span className="text-[#E5A93C]">{activeTab}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateProjectModal(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              Create Project
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5A93C]" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#161B26] border border-[#2B354A] rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {user && notifications.some((n) => !n.read) && (
                      <button
                        onClick={() => markAllNotificationsRead(user.uid, notifications)}
                        className="text-[11px] text-[#E5A93C] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-4">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-lg border text-xs ${
                            notif.read
                              ? 'bg-[#121622] border-white/5 text-slate-400'
                              : 'bg-[#1C2333] border-[#E5A93C]/30 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{notif.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Metric Counters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121622] p-5 rounded-xl border border-[#222838]">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Active Projects
                  </div>
                  <div className="text-3xl font-bold font-mono text-[#E5A93C] tabular-nums mt-2">
                    {activeProjectsCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#E5A93C]" />
                    <span>In progress deliverables</span>
                  </div>
                </div>

                <div className="bg-[#121622] p-5 rounded-xl border border-[#222838]">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Pending Quotes
                  </div>
                  <div className="text-3xl font-bold font-mono text-sky-400 tabular-nums mt-2">
                    {pendingRequestsCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-sky-400" />
                    <span>Awaiting scope review</span>
                  </div>
                </div>

                <div className="bg-[#121622] p-5 rounded-xl border border-[#222838]">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Awaiting Payments
                  </div>
                  <div className="text-3xl font-bold font-mono text-amber-400 tabular-nums mt-2">
                    {pendingPaymentsCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-amber-400" />
                    <span>Invoices pending authorization</span>
                  </div>
                </div>

                <div className="bg-[#121622] p-5 rounded-xl border border-[#222838]">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Completed Projects
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums mt-2">
                    {completedProjectsCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Delivered & verified</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Middle Grid: Active Projects + Deadlines & Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Projects Tracker */}
                <div className="lg:col-span-7 bg-[#121622] rounded-2xl p-6 border border-[#222838]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                      Active Projects Progress
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowCreateProjectModal(true)}
                        className="text-xs text-[#E5A93C] hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Create Project
                      </button>
                      {projects.length > 0 && (
                        <button
                          onClick={() => setActiveTab('projects')}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          View All ({projects.length}) →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="py-10 text-center space-y-3 bg-[#151B27]/50 rounded-xl border border-dashed border-white/10 p-6">
                        <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
                        <div className="text-xs font-bold text-white">
                          No active projects in your workspace
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Launch your first project or submit a task brief to begin collaborating with
                          our virtual task specialists.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowCreateProjectModal(true)}
                            icon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Create Project
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab('request')}
                          >
                            Submit Task Request
                          </Button>
                        </div>
                      </div>
                    ) : (
                      projects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          className="p-4 rounded-xl bg-[#161B26] border border-white/5 hover:border-[#E5A93C]/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="text-xs font-mono text-[#E5A93C] font-semibold">
                                {proj.id} · {proj.serviceName}
                              </div>
                              <h4 className="text-sm font-bold text-white group-hover:text-[#F5B942] transition-colors mt-0.5">
                                {proj.title}
                              </h4>
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                proj.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : proj.status === 'In Progress'
                                  ? 'bg-[#E5A93C]/10 text-[#E5A93C] border-[#E5A93C]/20'
                                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              }`}
                            >
                              {proj.status}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-[#0D1017] rounded-full h-2 overflow-hidden mb-2">
                            <div
                              className="bg-gradient-to-r from-[#E5A93C] to-[#F5B942] h-full transition-all duration-500"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Progress: {proj.progress}%</span>
                            <span>Deadline: {proj.deadline}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Deadlines & Recent Messages */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Upcoming Deadlines */}
                  <div className="bg-[#121622] rounded-2xl p-6 border border-[#222838]">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#E5A93C]" />
                      <span>Upcoming Deadlines</span>
                    </h3>
                    <div className="space-y-3">
                      {projects.length === 0 ? (
                        <div className="text-xs text-slate-500 py-3 text-center">
                          No upcoming project deadlines.
                        </div>
                      ) : (
                        projects.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="p-3 rounded-lg bg-[#161B26] border border-white/5 flex items-center justify-between"
                          >
                            <div className="truncate pr-2">
                              <div className="text-xs font-semibold text-white truncate">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-400">{p.serviceName}</div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#E5A93C] shrink-0">
                              {p.deadline}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Messages Card */}
                  <div className="bg-[#121622] rounded-2xl p-6 border border-[#222838]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#E5A93C]" />
                        <span>Project Messages</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="text-xs text-[#E5A93C] hover:underline cursor-pointer"
                      >
                        Open Inbox →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {messages.length === 0 ? (
                        <div className="text-xs text-slate-500 py-3 text-center">
                          No messages yet. Direct coordination will appear here.
                        </div>
                      ) : (
                        messages.slice(0, 2).map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-lg bg-[#161B26] border border-white/5 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                              <span className="font-semibold text-white">{m.senderName}</span>
                              <span className="font-mono">{m.timestamp}</span>
                            </div>
                            <p className="text-slate-300 line-clamp-2">{m.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                    My Active Projects
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track deliverable milestones, review logs, and progress status
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="bg-[#161B26] border border-[#2B354A] text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#E5A93C]"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateProjectModal(true)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Create Project
                  </Button>
                </div>
              </div>

              {/* Projects Table / Cards */}
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="bg-[#121622] rounded-2xl p-12 border border-[#222838] text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h3 className="text-base font-bold text-white font-display">
                        No Projects in Workspace
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Start by launching your first project or submitting a task brief. All project
                        deliverables and progress logs will be organized here securely.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCreateProjectModal(true)}
                      icon={<Plus className="w-3.5 h-3.5" />}
                      className="mx-auto"
                    >
                      Create First Project
                    </Button>
                  </div>
                ) : (
                  projects
                    .filter(
                      (p) =>
                        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
                        p.serviceName.toLowerCase().includes(projectSearch.toLowerCase())
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#121622] rounded-xl p-5 border border-[#222838] hover:border-[#E5A93C]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-mono text-xs font-bold text-[#E5A93C]">
                              {p.id}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-300 font-medium">
                              {p.serviceName}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                          {p.notes && (
                            <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl mb-3">
                              {p.notes}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                            <span>Deadline: {p.deadline}</span>
                            <span>·</span>
                            <span>Budget: ${p.budget}</span>
                            <span>·</span>
                            <span>Created: {p.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                              p.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : p.status === 'In Progress'
                                ? 'bg-[#E5A93C]/10 text-[#E5A93C] border-[#E5A93C]/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}
                          >
                            {p.status}
                          </span>
                          <div className="w-full">
                            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                              <span>Milestone</span>
                              <span>{p.progress}%</span>
                            </div>
                            <div className="w-full bg-[#0D1017] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#E5A93C] h-full"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedProject(p)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View Scope
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NEW REQUEST */}
          {activeTab === 'request' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Submit Service Request
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Specify your project requirements, target deadline, and desired deliverables
                </p>
              </div>

              <div className="bg-[#121622] rounded-2xl p-7 border border-[#222838] shadow-xl">
                {reqSubmittedSuccess ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Request Submitted Successfully!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Our operational team has logged your requirements. You will receive a quote
                      notification in your dashboard within 2–4 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitServiceRequest} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Select Service Category *
                      </label>
                      <select
                        value={reqService}
                        onChange={(e) => setReqService(e.target.value)}
                        className="w-full bg-[#161B26] border border-[#2B354A] text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E5A93C]"
                      >
                        {SERVICES_DATA.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} — {s.shortDesc.slice(0, 45)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Estimated Budget Range"
                        placeholder="e.g. $400 - $800"
                        value={reqBudget}
                        onChange={(e) => setReqBudget(e.target.value)}
                      />

                      <Input
                        label="Required Completion Date"
                        type="date"
                        value={reqDeadline}
                        onChange={(e) => setReqDeadline(e.target.value)}
                        required
                      />
                    </div>

                    <Textarea
                      label="Task Scope & Detailed Instructions *"
                      placeholder="Please explain data volume (e.g. 10,000 rows), input format, rules, formula preferences, or quality requirements..."
                      value={reqRequirements}
                      onChange={(e) => setReqRequirements(e.target.value)}
                      rows={5}
                      required
                    />

                    {/* File Attachment Placeholder */}
                    <div className="p-4 rounded-xl border border-dashed border-[#2B354A] bg-[#161B26]/50 text-center">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <div className="text-xs text-slate-300 font-semibold">
                        Attach Sample Data / Instruction Sheets (Optional)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Supports CSV, XLSX, PDF, DOCX, ZIP (Up to 50MB)
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setActiveTab('overview')}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        isLoading={isSubmittingRequest}
                      >
                        Submit Project Brief
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Official Quotations & Proposals
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Review itemized cost breakdowns and approve proposals to begin work
                </p>
              </div>

              <div className="space-y-4">
                {quotations.length === 0 ? (
                  <div className="bg-[#121622] rounded-2xl p-12 border border-[#222838] text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Quotations Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Itemized project proposals for your submitted requests will appear here for your
                      review and approval.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('request')}
                      className="mx-auto"
                    >
                      Submit Task Request
                    </Button>
                  </div>
                ) : (
                  quotations.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#121622] rounded-xl p-6 border border-[#222838] flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-[#E5A93C] font-bold">
                            {q.quoteNumber}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-300">{q.serviceName}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">{q.scopeSummary}</h3>
                        <div className="text-xs text-slate-400 font-mono">
                          Issued: {q.issuedDate} · Valid Until: {q.validUntil}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                        <div className="text-xl font-bold font-mono text-white">
                          ${q.amount} <span className="text-xs text-slate-400">USD</span>
                        </div>

                        {q.status === 'Approved' ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                            ✓ Proposal Approved
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveQuote(q.id)}
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve Quote
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Invoices & Payments
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Billing history, invoices, and payment authorizations
                </p>
              </div>

              <div className="bg-[#121622] rounded-xl border border-[#222838] overflow-hidden">
                {payments.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <CreditCard className="w-10 h-10 text-slate-500 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No Invoices or Payments</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Invoices for approved project quotations will appear here with secure payment
                      options.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#161B26] text-slate-400 font-mono uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Service Description</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              {p.invoiceNumber}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 font-medium">
                              {p.serviceName}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono">{p.date}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              ${p.amount}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                  p.status === 'Paid'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {p.status === 'Pending' ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleSimulatePayment(p.id)}
                                >
                                  Pay Now
                                </Button>
                              ) : (
                                <button className="text-slate-400 hover:text-white inline-flex items-center gap-1 font-mono">
                                  <Download className="w-3.5 h-3.5 text-[#E5A93C]" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="max-w-4xl mx-auto bg-[#121622] rounded-2xl border border-[#222838] flex flex-col h-[600px] overflow-hidden">
              <div className="p-4 border-b border-[#222838] bg-[#151B27] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Alpha Virtual Task Support Desk</h3>
                  <div className="text-xs text-slate-400">
                    Live coordination on active data milestones
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-300">Project Lead Active</span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-500" />
                    <div className="text-xs font-bold text-white">No Messages Yet</div>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Send a message below to communicate directly with your dedicated virtual task
                      manager.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isClient = m.senderRole === 'client';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-500 mb-1 font-mono">
                          {m.senderName} · {m.timestamp}
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isClient
                              ? 'bg-[#E5A93C] text-black font-medium rounded-tr-none'
                              : 'bg-[#1C2333] text-slate-200 border border-white/5 rounded-tl-none'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#222838] bg-[#151B27] flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Type a message or instruction for your project team..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-[#10141E] border border-[#283244] text-xs sm:text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#E5A93C]"
                />
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  icon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* TAB 7: FILES */}
          {activeTab === 'files' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Project Files & Deliverables
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Download finalized audit sheets, cleaned datasets, and client project briefs
                </p>
              </div>

              {projects.length === 0 ? (
                <div className="bg-[#121622] rounded-2xl p-12 border border-[#222838] text-center space-y-3">
                  <FolderDown className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No Deliverables Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Cleaned datasets, converted files, and audit reports will be available for
                    download here as your projects are completed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#121622] p-5 rounded-xl border border-[#222838] hover:border-[#E5A93C]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-[#E5A93C] font-semibold">
                            {p.id}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {p.deliverablesCount} file(s)
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 truncate">{p.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {p.notes || `${p.serviceName} deliverable package.`}
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                        <span
                          className={`text-[11px] font-medium ${
                            p.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                        <button className="text-xs text-[#E5A93C] hover:underline flex items-center gap-1 font-semibold">
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Archive</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Share Your Feedback
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Help us maintain our 99.8% satisfaction benchmark
                </p>
              </div>

              <div className="bg-[#121622] p-7 rounded-2xl border border-[#222838]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you! Your verified client review has been recorded.');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project Associated With This Review
                    </label>
                    {projects.length > 0 ? (
                      <select className="w-full bg-[#161B26] border border-[#2B354A] text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E5A93C]">
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.id} — {p.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        defaultValue="General Virtual Assistance & Data Support"
                        className="w-full bg-[#161B26] border border-[#2B354A] text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-[#E5A93C] hover:scale-110 transition-transform p-1 cursor-pointer"
                        >
                          <Star className="w-5 h-5 fill-[#E5A93C]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Your Detailed Review"
                    placeholder="Describe how Alpha Virtual Task helped streamline your workflows, accuracy, speed, and communication..."
                    rows={4}
                    required
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="md" type="submit">
                      Post Review
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Client Profile & Account Settings
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Private profile synchronized with your Firebase account
                </p>
              </div>

              <div className="bg-[#121622] p-7 rounded-2xl border border-[#222838] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={clientUser.name} readOnly />
                  <Input label="Account Email" defaultValue={clientUser.email} readOnly />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    defaultValue={clientUser.company || 'Personal Client'}
                  />
                  <Input label="Phone" defaultValue={clientUser.phone || 'Not provided'} />
                </div>
                <div className="pt-2 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>Firebase UID: {user?.uid}</span>
                  <Button variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Project: ${selectedProject.id}`}
          subtitle={selectedProject.title}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="grid grid-cols-2 gap-3 bg-[#161B26] p-3.5 rounded-xl border border-white/5 font-mono">
              <div>
                <span className="text-slate-400">Service:</span>{' '}
                <span className="text-white font-semibold">{selectedProject.serviceName}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <span className="text-[#E5A93C] font-semibold">{selectedProject.status}</span>
              </div>
              <div>
                <span className="text-slate-400">Budget:</span>{' '}
                <span className="text-white font-semibold">${selectedProject.budget}</span>
              </div>
              <div>
                <span className="text-slate-400">Target Date:</span>{' '}
                <span className="text-white font-semibold">{selectedProject.deadline}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">
                Project Scope & Deliverable Notes
              </h4>
              <p className="leading-relaxed bg-[#161B26] p-3 rounded-lg border border-white/5">
                {selectedProject.notes || 'No extra notes provided.'}
              </p>
            </div>

            {selectedProject.adminNotes && (
              <div>
                <h4 className="font-bold text-[#E5A93C] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Operations Team Progress Notes</span>
                </h4>
                <p className="leading-relaxed bg-[#E5A93C]/10 p-3 rounded-lg border border-[#E5A93C]/30 text-amber-200">
                  {selectedProject.adminNotes}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedProject(null);
                  setActiveTab('messages');
                }}
              >
                Message Team About Project
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <Modal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          title="Create New Project"
          subtitle="Initialize a private project in your Firebase workspace"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs sm:text-sm">
            <Input
              label="Project Title *"
              placeholder="e.g. Q2 Customer Data Cleaning & Deduplication"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Category *
              </label>
              <select
                value={newProjectService}
                onChange={(e) => setNewProjectService(e.target.value)}
                className="w-full bg-[#161B26] border border-[#2B354A] text-white text-xs sm:text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E5A93C]"
              >
                {SERVICES_DATA.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Completion Date *"
                type="date"
                value={newProjectDeadline}
                onChange={(e) => setNewProjectDeadline(e.target.value)}
                required
              />

              <Input
                label="Estimated Budget (USD)"
                type="number"
                placeholder="350"
                value={newProjectBudget}
                onChange={(e) => setNewProjectBudget(e.target.value)}
              />
            </div>

            <Textarea
              label="Project Scope & Deliverable Notes (Optional)"
              placeholder="Explain formatting specifications, raw inputs, columns, or verification criteria..."
              value={newProjectNotes}
              onChange={(e) => setNewProjectNotes(e.target.value)}
              rows={3}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowCreateProjectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isCreatingProject}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Launch Project
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
