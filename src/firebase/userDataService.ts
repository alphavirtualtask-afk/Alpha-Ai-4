import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  ProjectItem,
  ProjectStatus,
  ServiceRequestItem,
  QuotationItem,
  PaymentItem,
  MessageItem,
  NotificationItem,
  UserProfile,
} from '../types';
import { createBooking } from './bookingService';

// Utility to remove undefined fields to avoid Firestore setDoc errors
function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}

// ==========================================
// 1. USER PROJECTS: users/{uid}/projects
// ==========================================

export const subscribeUserProjects = (
  uid: string,
  onData: (projects: ProjectItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'projects');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ProjectItem);
      });
      // Sort newest first
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to projects for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/projects`);
    }
  );
};

export const createUserProject = async (
  uid: string,
  input: {
    title: string;
    serviceId: string;
    serviceName: string;
    deadline: string;
    clientName: string;
    clientEmail: string;
    budget?: number;
    notes?: string;
    deliverablesCount?: number;
  }
): Promise<ProjectItem> => {
  const projectId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = doc(db, 'users', uid, 'projects', projectId);

  const newProject: ProjectItem = {
    id: projectId,
    title: input.title,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    status: 'In Progress',
    progress: 10,
    deadline: input.deadline,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    budget: input.budget || 250,
    createdAt: new Date().toISOString().split('T')[0],
    deliverablesCount: input.deliverablesCount || 1,
    notes: input.notes || 'Project initialized in user workspace.',
  };

  try {
    await setDoc(docRef, cleanUndefined(newProject));

    // Also create an initial notification for the user
    await createUserNotification(uid, {
      title: 'Project Initialized',
      message: `Your project "${newProject.title}" has been launched successfully.`,
      type: 'success',
    });

    return newProject;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/projects/${projectId}`);
  }
};

// ==========================================
// 2. USER REQUESTS: users/{uid}/requests
// ==========================================

export const subscribeUserRequests = (
  uid: string,
  onData: (requests: ServiceRequestItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'requests');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ServiceRequestItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ServiceRequestItem);
      });
      items.sort(
        (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
      );
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to requests for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/requests`);
    }
  );
};

export const createUserRequest = async (
  uid: string,
  input: {
    clientName: string;
    email: string;
    phone?: string;
    serviceName: string;
    requirements: string;
    budgetEstimate?: string;
    deadline?: string;
  }
): Promise<ServiceRequestItem> => {
  const reqId = `REQ-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  const userReqRef = doc(db, 'users', uid, 'requests', reqId);

  const newRequest: ServiceRequestItem = {
    id: reqId,
    clientName: input.clientName,
    email: input.email,
    phone: input.phone || '',
    serviceName: input.serviceName,
    requirements: input.requirements,
    budgetEstimate: input.budgetEstimate || 'Standard Estimate',
    deadline: input.deadline || '2–3 Days',
    status: 'New',
    submittedDate: new Date().toISOString().split('T')[0],
  };

  try {
    // 1. Store in user's isolated subcollection: users/{uid}/requests/{reqId}
    await setDoc(userReqRef, cleanUndefined(newRequest));

    // 2. Also register in top-level bookings for admin coordination
    await createBooking({
      userId: uid,
      clientName: input.clientName,
      email: input.email,
      phone: input.phone,
      serviceName: input.serviceName,
      requirements: input.requirements,
      budgetEstimate: input.budgetEstimate,
      deadline: input.deadline,
    });

    // 3. User notification
    await createUserNotification(uid, {
      title: 'Task Request Submitted',
      message: `Your request for ${input.serviceName} has been received. Our team will review and send a quote.`,
      type: 'info',
    });

    return newRequest;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/requests/${reqId}`);
  }
};

// ==========================================
// 3. USER QUOTATIONS: users/{uid}/quotations
// ==========================================

export const subscribeUserQuotations = (
  uid: string,
  onData: (quotes: QuotationItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'quotations');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: QuotationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as QuotationItem);
      });
      items.sort(
        (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
      );
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to quotations for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/quotations`);
    }
  );
};

export const updateUserQuotationStatus = async (
  uid: string,
  quoteId: string,
  status: QuotationItem['status']
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'quotations', quoteId);
  try {
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/quotations/${quoteId}`);
  }
};

// ==========================================
// 4. USER PAYMENTS: users/{uid}/payments
// ==========================================

export const subscribeUserPayments = (
  uid: string,
  onData: (payments: PaymentItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'payments');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PaymentItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PaymentItem);
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to payments for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/payments`);
    }
  );
};

export const updateUserPaymentStatus = async (
  uid: string,
  paymentId: string,
  status: PaymentItem['status']
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'payments', paymentId);
  try {
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/payments/${paymentId}`);
  }
};

// ==========================================
// 5. USER MESSAGES: users/{uid}/messages
// ==========================================

export const subscribeUserMessages = (
  uid: string,
  onData: (messages: MessageItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'messages');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: MessageItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MessageItem);
      });
      items.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to messages for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/messages`);
    }
  );
};

export const sendUserMessage = async (
  uid: string,
  text: string,
  senderName: string,
  senderRole: 'client' | 'admin' = 'client'
): Promise<MessageItem> => {
  const msgId = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const docRef = doc(db, 'users', uid, 'messages', msgId);

  const newMsg: MessageItem = {
    id: msgId,
    senderName,
    senderRole,
    recipientRole: senderRole === 'client' ? 'admin' : 'client',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: senderRole === 'client',
  };

  try {
    await setDoc(docRef, cleanUndefined(newMsg));
    return newMsg;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/messages/${msgId}`);
  }
};

// ==========================================
// 6. USER NOTIFICATIONS: users/{uid}/notifications
// ==========================================

export const subscribeUserNotifications = (
  uid: string,
  onData: (notifs: NotificationItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users', uid, 'notifications');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as NotificationItem);
      });
      items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to notifications for user ${uid}:`, err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, `users/${uid}/notifications`);
    }
  );
};

export const createUserNotification = async (
  uid: string,
  input: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'alert';
  }
): Promise<void> => {
  const notifId = `NTF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const docRef = doc(db, 'users', uid, 'notifications', notifId);

  const newNotif: NotificationItem = {
    id: notifId,
    title: input.title,
    message: input.message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: input.type || 'info',
    read: false,
  };

  try {
    await setDoc(docRef, cleanUndefined(newNotif));
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/notifications/${notifId}`);
  }
};

export const markAllNotificationsRead = async (
  uid: string,
  notifs: NotificationItem[]
): Promise<void> => {
  try {
    await Promise.all(
      notifs
        .filter((n) => !n.read)
        .map((n) => updateDoc(doc(db, 'users', uid, 'notifications', n.id), { read: true }))
    );
  } catch (err) {
    console.error('Error marking notifications as read:', err);
  }
};

// ==========================================
// 7. ADMIN METHODS: Manage real registered clients
// ==========================================

export const subscribeAllClients = (
  onData: (clients: UserProfile[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const clients: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        // Exclude system admin from client lists
        if (data.email !== 'alphavirtualtask@gmail.com' && data.role !== 'admin') {
          clients.push({
            ...data,
            id: docSnap.id,
            status: data.status || data.accountStatus || 'Active',
            accountStatus: data.accountStatus || data.status || 'Active',
          });
        }
      });
      // Sort newest first
      clients.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(clients);
    },
    (err) => {
      console.error('Error subscribing to all clients:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  );
};

export const updateClientStatus = async (
  uid: string,
  status: 'Active' | 'Inactive' | 'Suspended'
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      status,
      accountStatus: status,
      updatedAt: new Date().toISOString(),
    });

    // Notify client about status change
    await createUserNotification(uid, {
      title: 'Account Status Update',
      message: `Your account status is currently: ${status}.`,
      type: status === 'Active' ? 'success' : status === 'Suspended' ? 'alert' : 'info',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
};

export const updateUserProjectStatus = async (
  uid: string,
  projectId: string,
  status: ProjectStatus,
  adminNotes?: string
): Promise<void> => {
  const projRef = doc(db, 'users', uid, 'projects', projectId);
  try {
    const progressMap: Record<ProjectStatus, number> = {
      'New': 10,
      'Reviewing': 25,
      'Accepted': 35,
      'In Progress': 60,
      'Waiting for Client': 75,
      'Completed': 100,
      'Cancelled': 0,
      'Under Review': 85,
      'Pending Approval': 30,
    };

    const updates: Record<string, any> = {
      status,
      progress: progressMap[status] ?? 50,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    await updateDoc(projRef, cleanUndefined(updates));

    // Send instant live notification to client workspace
    await createUserNotification(uid, {
      title: 'Project Status Updated',
      message: `Project status was changed to "${status}".${adminNotes ? ` Note: ${adminNotes}` : ''}`,
      type: status === 'Completed' ? 'success' : status === 'Cancelled' ? 'alert' : 'info',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/projects/${projectId}`);
  }
};

export const createUserPayment = async (
  uid: string,
  input: {
    invoiceNumber: string;
    clientName: string;
    serviceName: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    date: string;
    paymentMethod: string;
    transactionId?: string;
  }
): Promise<PaymentItem> => {
  const payId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const docRef = doc(db, 'users', uid, 'payments', payId);

  const newPayment: PaymentItem = {
    id: payId,
    invoiceNumber: input.invoiceNumber,
    clientName: input.clientName,
    serviceName: input.serviceName,
    amount: input.amount,
    status: input.status,
    date: input.date,
    paymentMethod: input.paymentMethod,
    transactionId: input.transactionId,
    clientId: uid,
  };

  try {
    await setDoc(docRef, cleanUndefined(newPayment));
    await createUserNotification(uid, {
      title: 'Invoice / Payment Issued',
      message: `A new payment invoice for $${input.amount} (${input.serviceName}) has been generated.`,
      type: 'info',
    });
    return newPayment;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${uid}/payments/${payId}`);
  }
};

export const markUserMessageRead = async (
  uid: string,
  messageId: string
): Promise<void> => {
  const msgRef = doc(db, 'users', uid, 'messages', messageId);
  try {
    await updateDoc(msgRef, { unread: false });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/messages/${messageId}`);
  }
};
