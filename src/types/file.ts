// ----------------------------------------------------------------------

export type IFileFilterValue = string | string[] | Date | null;

export type IFileFilters = {
  name: string;
  type: string[];
};

// ----------------------------------------------------------------------

export type IFileShared = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  permission: string;
};

export type IFolderManager = {
  folder_name: string;
  file_count: number;
  folder_size: string;
};

export type IFileManager = {
  unique_key: string;
  name: string;
  path: string;
  extension: string;
  size: string;
};

export type IFile = IFileManager;
