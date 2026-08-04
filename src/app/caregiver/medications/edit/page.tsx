import { Suspense } from 'react';

import { CaregiverView } from '@/views/caregiver';

const EditCaregiverMedicationPage = () => (
  <Suspense>
    <CaregiverView screen="edit" />
  </Suspense>
);

export default EditCaregiverMedicationPage;
