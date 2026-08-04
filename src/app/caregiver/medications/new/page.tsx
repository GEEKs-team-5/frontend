import { Suspense } from 'react';

import { CaregiverView } from '@/views/caregiver';

const NewCaregiverMedicationPage = () => (
  <Suspense>
    <CaregiverView screen="new" />
  </Suspense>
);

export default NewCaregiverMedicationPage;
