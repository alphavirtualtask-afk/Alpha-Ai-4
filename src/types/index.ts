export type ViewMode = 
  | 'home'
  | 'client-signin'
  | 'client-signup'
  | 'client-dashboard'
  | 'admin-login'
  | 'admin-dashboard';

export type ClientTab = 
  | 'overview'
  | 'projects'
  | 'request'
  | 'quotations'
  | 'payments'
  | 'messages'
  | 'files'
  | 'reviews'
  | 'settings';

export type AdminTab = 
  | 'overview'
  | 'clients'
  | 'projects'
  | 'messages'
  | 'payments'
  | 'notifications'
  | 'settings';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'data-processing' | 'spreadsheets-research' | 'content-qa';
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  turnaround: string;
  iconName: string;
  recommendedFor: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  company: string;
  review: string;
  rating: number;
  avatarUrl: string;
  serviceUsed: string;
  date: string;
  verified: boolean;
}

export type ProjectStatus =
  | 'New'
  | 'Reviewing'
  | 'Accepted'
  | 'In Progress'
  | 'Waiting for Client'
  | 'Completed'
  | 'Cancelled'
  | 'Under Review'
  | 'Pending Approval';

export interface ProjectItem {
  id: string;
  title: string;
  serviceId: string;
  serviceName: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  clientName: string;
  clientEmail: string;
  budget: number;
  createdAt: string;
  deliverablesCount: number;
  notes?: string;
  adminNotes?: string;
  updatedAt?: string;
  clientId?: string;
}

export interface ServiceRequestItem {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  serviceName: string;
  requirements: string;
  budgetEstimate: string;
  deadline: string;
  status: 'New' | 'Quote Sent' | 'In Discussion' | 'Approved' | 'Completed' | 'Declined';
  submittedDate: string;
  clientId?: string;
}

export interface QuotationItem {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  scopeSummary: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Paid' | 'Expired';
  issuedDate: string;
  validUntil: string;
  clientId?: string;
}

export interface PaymentItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  serviceName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  paymentMethod: string;
  clientId?: string;
  clientEmail?: string;
  transactionId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  countryCode?: string;
  countryIso?: string;
  fullPhoneNumber?: string;
  role: 'client' | 'admin';
  company?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  accountStatus?: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface BookingItem {
  id: string;
  userId: string;
  clientName: string;
  email: string;
  phone?: string;
  serviceName: string;
  requirements: string;
  budgetEstimate?: string;
  deadline?: string;
  status: 'New' | 'Quote Sent' | 'In Discussion' | 'Approved' | 'Completed' | 'Declined';
  createdAt: string;
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderRole: 'client' | 'admin' | 'system';
  recipientRole: 'client' | 'admin';
  text: string;
  timestamp: string;
  unread: boolean;
  clientId?: string;
  clientEmail?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert';
  read: boolean;
}
