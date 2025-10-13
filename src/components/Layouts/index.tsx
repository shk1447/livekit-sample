import { ReactElement } from 'react';

export type BaseItem = {
  id: string;
  type: string;
  identity: string;
  title: string;
  render: (isMain?: boolean) => ReactElement;
};
