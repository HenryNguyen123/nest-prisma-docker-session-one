export interface RegisterType {
  id: number;
  email: string;
  userName: string;
  password: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  age?: number | null;
  dob?: Date | null;
  roleId?: number;
}

export interface LoginType {
  email: string;
  userName: string;
}

export interface LogoutBody {
  path: string;
}

export interface ResetPasswordType {
  resetPassword: string;
  key: string;
}

export interface MeType {
  key: string;
}
