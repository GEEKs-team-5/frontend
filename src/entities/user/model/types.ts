export type UserRoleType = 'PATIENT' | 'CAREGIVER';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface UserProfileResponseType {
  activeRole: UserRoleType;
  age: number | null;
  createdAt: string;
  email: string;
  gender: GenderType;
  id: string;
  updatedAt?: string;
}

export interface UpdateUserProfileReqType {
  age?: number;
  gender?: GenderType;
}
