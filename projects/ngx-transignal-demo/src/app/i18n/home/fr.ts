import type en from './en';
import { plural, select } from 'ngx-transignal';

export default {
  heading: 'FR Home heading',
  array: ['FR home 1', 'FR home 2', 'FR home 3'],
  homeNested: {
    blocks: {
      something: 'FR Example something',
      array: ['FR nested home 1', 'FR nested home 2', 'FR nested home 3'],
    },
  },
  plural: {
    users: plural({
      1: '1 french user',
      few: 'only {count} french users',
      other: '{count} french users',
    }),
  },
  select: {
    categories: select({
      all: 'All french categories',
      test: 'Test french category',
      null: 'FR None',
    }),
  },
} satisfies typeof en;
