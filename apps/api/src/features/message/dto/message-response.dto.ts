export type MessageResponseDto = {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: 'text';
  sequence: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};
