import type en from './en';

export default {
  heading: 'FR Home heading',
  array: ['FR home 1', 'FR home 2', 'FR home 3'],
  homeNested: {
    blocks: {
      something: 'FR Example something',
      array: ['FR nested home 1', 'FR nested home 2', 'FR nested home 3'],
    },
  },
} satisfies typeof en;
