import { Timestamp } from 'firebase/firestore';

export interface Participant {
  uid: string;
  name: string;
  role: 'host' | 'participant';
}

export interface Room {
  roomId: string;
  hostId: string;
  participants: Participant[];
  isRecording: boolean;
  createdAt: Timestamp;
}
