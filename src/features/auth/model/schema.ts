import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상 입력해주세요.'),
});

const AgeSchema = z.coerce.number().int().positive('나이를 입력해주세요.');

export const RegisterSchema = LoginSchema.extend({
  age: AgeSchema.optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  role: z.enum(['PATIENT', 'CAREGIVER']),
});

type SignupStepType = 'email' | 'password' | 'role' | 'profile' | 'invite';

interface SignupValuesType {
  age?: string;
  email?: string;
  gender?: string;
  inviteCode?: string;
  password?: string;
  passwordConfirmation?: string;
  role?: string;
}

const getSchemaMessage = (result: {
  error?: { issues: { message: string }[] };
  success: boolean;
}) => (result.success ? null : (result.error?.issues[0]?.message ?? '입력값을 확인해주세요.'));

export const getSignupValidationMessage = (step: SignupStepType, values: SignupValuesType) => {
  if (step === 'email') return getSchemaMessage(LoginSchema.shape.email.safeParse(values.email));

  if (step === 'password') {
    const passwordMessage = getSchemaMessage(LoginSchema.shape.password.safeParse(values.password));
    if (passwordMessage) return passwordMessage;

    return values.password === values.passwordConfirmation ? null : '비밀번호가 일치하지 않습니다.';
  }

  if (step === 'role') return values.role ? null : '사용자 유형을 선택해주세요.';

  if (step === 'profile') {
    const ageMessage = getSchemaMessage(AgeSchema.safeParse(values.age));
    if (ageMessage) return ageMessage;

    return values.gender ? null : '성별을 선택해주세요.';
  }

  return /^\d{6}$/.test(values.inviteCode?.trim() ?? '') ? null : '6자리 초대 코드를 입력해주세요.';
};
