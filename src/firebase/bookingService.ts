import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { BookingItem } from '../types';

export interface CreateBookingInput {
  userId: string;
  clientName: string;
  email: string;
  phone?: string;
  serviceName: string;
  requirements: string;
  budgetEstimate?: string;
  deadline?: string;
}

export const createBooking = async (input: CreateBookingInput): Promise<string> => {
  const bookingId = `AVT-BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const bookingDocRef = doc(db, 'bookings', bookingId);

  const rawBooking: Record<string, any> = {
    id: bookingId,
    userId: input.userId,
    clientName: input.clientName,
    email: input.email,
    serviceName: input.serviceName,
    requirements: input.requirements,
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  if (input.phone?.trim()) rawBooking.phone = input.phone.trim();
  if (input.budgetEstimate?.trim()) rawBooking.budgetEstimate = input.budgetEstimate.trim();
  if (input.deadline?.trim()) rawBooking.deadline = input.deadline.trim();

  const newBooking = rawBooking as BookingItem;

  try {
    await setDoc(bookingDocRef, newBooking);
    return bookingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `bookings/${bookingId}`);
  }
};

export const subscribeUserBookings = (
  userId: string,
  onData: (bookings: BookingItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings: BookingItem[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as BookingItem);
      });
      // Sort newest first
      bookings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(bookings);
    },
    (error) => {
      console.error('Error listening to user bookings:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    }
  );
};

export const subscribeAllBookings = (
  onData: (bookings: BookingItem[]) => void,
  onError?: (err: Error) => void
) => {
  const q = collection(db, 'bookings');

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings: BookingItem[] = [];
      snapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as BookingItem);
      });
      bookings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(bookings);
    },
    (error) => {
      console.error('Error listening to all bookings:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    }
  );
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingItem['status']
): Promise<void> => {
  const ref = doc(db, 'bookings', bookingId);
  try {
    await updateDoc(ref, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
};
