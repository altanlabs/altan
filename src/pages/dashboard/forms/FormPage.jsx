import React, { memo } from 'react';
import { useParams } from 'react-router-dom';

import { CompactLayout } from '../../../layouts/dashboard';
import { useSelector } from '../../../redux/store';
import FormEditor from '../../../sections/@dashboard/forms/FormEditor';

function FormPage() {
  const { formId } = useParams();
  const forms = useSelector((state) => state.general.account?.forms || []);
  const currentForm = forms.find((form) => form.id === formId);

  return (
    <CompactLayout
      title={`${currentForm?.name} · Form · Altan`}
      overflowHidden={true}
      noPadding
    >
      <FormEditor formId={formId} />
    </CompactLayout>
  );
}

export default memo(FormPage);
