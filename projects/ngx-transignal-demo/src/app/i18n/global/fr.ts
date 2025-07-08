import type en from './en';

export default {
  title: {
    default: 'FR Transignal demo',
  },
  heading: 'French heading',
  array: ['FR entry 1', 'FR entry 2', 'FR entry 3'],
  nested: {
    nested2: {
      heading: 'French heading',
      array: ['FR entry 1', 'FR entry 2', 'FR entry 3'],
    },
  },
} satisfies typeof en;
