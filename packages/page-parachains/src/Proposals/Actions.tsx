// Copyright 2017-2025 @polkadot/app-parachains authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { Button } from '@polkadot/react-components';
import { useAccounts, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate.js';
import Propose from './Propose.js';

interface Props {
  className?: string;
}

function Actions (): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { hasAccounts } = useAccounts();
  const [showPropose, togglePropose] = useToggle();

  return (
    <>
      <Button.Group>
        <Button
          icon='plus'
          isDisabled={!hasAccounts}
          label={t('Propose')}
          onClick={togglePropose}
        />
      </Button.Group>
      {showPropose && (
        <Propose onClose={togglePropose} />
      )}
    </>
  );
}

export default React.memo(Actions);
