import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type IEmployeeTableFilterValue = string | string[];

export type IEmployeeTableFilters = {
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IEmployeeSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type IEmployeeProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IEmployeeProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: IEmployeeSocialLink;
};

export type IEmployeeProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IEmployeeProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date | string | number;
};

export type IEmployeeProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IEmployeeProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: Date | string | number;
  personLikes: {
    name: string;
    avatarUrl: string;
  }[];
  comments: {
    id: string;
    message: string;
    createdAt: Date | string | number;
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }[];
};

export type IEmployeeCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IEmployeeRole = {
  name: string;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number
  }
}

export type IEmployeeItem = {
  unique_key: string;
  name: string;
  email: string | null;
  mobile: string | null;
  lang: string;
  level: number;
  status: number;
  created_at: string;
  updated_at: string;
  roles: IEmployeeRole[];
};

export type IEmployeeAccount = {
  email: string;
  isPublic: boolean;
  displayName: string;
  city: string | null;
  state: string | null;
  about: string | null;
  country: string | null;
  address: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  photoURL: CustomFile | string | null;
};

export type IEmployeeAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: Date | string | number;
};

export type IEmployeeAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
