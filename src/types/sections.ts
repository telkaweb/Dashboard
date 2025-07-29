import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IKanbanComment = {
  id: string;
  name: string;
  message: string;
  avatarUrl: string;
  messageType: 'image' | 'text';
  createdAt: Date | string | number;
};

export type IKanbanAssignee = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  address: string;
  avatarUrl: string;
  phoneNumber: string;
  lastActivity: Date | string;
};

export type ISectionTask = {
  id: string;
  name: string;
  status: number;
  data?: string[];
  position: string;
  sort: number;
  description?: string;
  attachments: {
    unique_key:string;
    name:string;
    path:string;
    extension:string;
  }[];
};

export type ISectionColumn = {
  id: string;
  name: string;
  type: number;
  taskIds: string[];
};

export type IKanbanBoard = {
  tasks: ISectionTask[];
  columns: ISectionColumn[];
  ordered: string[];
};

// ----------------------------------------------------------------------

export type IKanbanState = {
  board: {
    tasks: Record<string, ISectionTask>;
    columns: Record<string, ISectionColumn>;
    ordered: string[];
  };
  boardStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
