import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IContactParticipant = {
  id: string;
  name: string;
  family: string;
  email: string;
  phoneNumber: string;
};

export type IContactConversation = {
  unique_key: string;
  name: string;
  family: string;
  mobile?: string;
  email?: string;
  title?: string;
  description?: string;
  created_at: string;
  created_at_fa: string;
  product?:{
    unique_key: string;
    title: string;
    cover?: {
      unique_key: string;
      name: string;
      path: string;
    }
  };
  city?:{
    unique_key: string;
    name: string;
    province?: {
      unique_key: string;
      name: string;
    }
  }
};

// ----------------------------------------------------------------------

export type IContactContactsState = {
  byId: Record<string, IContactParticipant>;
  allIds: string[];
};

export type IContactConversationsState = {
  byId: Record<string, IContactConversation>;
  allIds: string[];
};

export type IContactState = {
  contacts: IContactParticipant[];
  recipients: IContactParticipant[];
  conversations: IContactConversationsState;
  currentConversationId: string | null;
  conversationsStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
