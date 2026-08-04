import { post } from '@/shared';

import type { CareInvitationResponseType, CareRelationshipResponseType } from '../model/types';

const careLinkUrl = {
  postAcceptInvitation: () => 'api/v1/care-links/accept',
  postInvitation: () => 'api/v1/care-links/invitations',
} as const;

export const postAcceptInvitation = (code: string) =>
  post<CareRelationshipResponseType>(careLinkUrl.postAcceptInvitation(), { code });

export const postCareInvitation = () =>
  post<CareInvitationResponseType>(careLinkUrl.postInvitation());
