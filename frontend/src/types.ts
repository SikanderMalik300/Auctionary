export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Bid {
  id: number;
  amount: number;
  timestamp: string;
  bidderId: number;
  bidderName?: string;
}

export interface Question {
  id: number;
  questionText: string;
  answerText?: string;
  askerId: number;
  timestamp: string;
}

export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  sellerId: number;
  sellerName?: string;
  categoryId: number;
  categoryName?: string;
  startingBid: number;
  currentBid: number;
  endDate: string;
  status?: 'OPEN' | 'SOLD' | 'EXPIRED';
  imageUrl?: string;
}

export interface SearchParams {
  q?: string;
  categoryId?: number;
  status?: string;
  limit?: number;
  offset?: number;
  sellerId?: number;
  bidderId?: number;
}
