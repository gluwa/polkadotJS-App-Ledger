// Copyright 2017-2025 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyedEvent } from '@polkadot/react-hooks/ctx/types';
import type { BlockNumber, Extrinsic } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import React, { useMemo } from 'react';

import { Table } from '@polkadot/react-components';

import { useTranslation } from '../translate.js';
import ExtrinsicDisplay from './Extrinsic.js';

interface Props {
  blockNumber?: BlockNumber;
  className?: string;
  events?: KeyedEvent[] | null;
  label?: React.ReactNode;
  maxBlockWeight?: BN;
  value?: Extrinsic[] | null;
  withLink: boolean;
}

function Extrinsics ({ blockNumber, className = '', events, label, maxBlockWeight, value, withLink }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const header = useMemo<[React.ReactNode?, string?, number?][]>(
    () => [
      [label || t('extrinsics'), 'start', 2],
      [t('events'), 'start media--1000', 2],
      [t('weight'), 'media--1400'],
      [undefined, 'address media--1200']
    ],
    [label, t]
  );

  return (
    <Table
      className={className}
      empty={t('No extrinsics available')}
      header={header}
      isFixed
    >
      {value?.map((extrinsic, index): React.ReactNode =>
        <ExtrinsicDisplay
          blockNumber={blockNumber}
          events={events}
          index={index}
          key={`extrinsic:${index}`}
          maxBlockWeight={maxBlockWeight}
          value={extrinsic}
          withLink={withLink}
        />
      )}
    </Table>
  );
}

export default React.memo(Extrinsics);
