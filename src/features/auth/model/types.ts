export type UserRoleType = 'PATIENT' | 'CAREGIVER';

export type GenderType = 'MALE' | 'FEMALE';

export interface LoginReqType {
  email: string;
  password: string;
}

export interface RegisterReqType extends LoginReqType {
  age: number;
  gender: GenderType;
  role: UserRoleType;
}

export interface AuthResponseType {
  accessToken: string;
  tokenType: string;
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
