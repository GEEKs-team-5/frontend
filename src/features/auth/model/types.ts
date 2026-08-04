export type UserRoleType = 'PATIENT' | 'CAREGIVER';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface LoginReqType {
  email: string;
  password: string;
}

export interface RegisterReqType extends LoginReqType {
  age?: number;
  gender?: GenderType;
  role: UserRoleType;
}

export interface UserProfileResponseType {
  activeRole: UserRoleType;
  age: number | null;
  createdAt: string;
  email: string;
  gender: GenderType;
  id: string;
  updatedAt?: string;
}

export interface AuthResponseType {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserProfileResponseType;
}

export interface CareInvitationResponseType {
  code: string;
  expiresAt: string;
  id: string;
}

export interface CareRelationshipResponseType {
  id: string;
  status: 'ACTIVE' | 'DISCONNECTED';
}
