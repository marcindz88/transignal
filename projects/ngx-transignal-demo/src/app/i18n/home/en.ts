import { plural, select } from 'ngx-transignal';

export default {
  heading: 'Home heading - {test}',
  array: ['home 1', 'home 2', 'home 3'],
  homeNested: {
    blocks: {
      something: 'Example something',
      array: ['nested home 1', 'nested home 2', 'nested home 3'],
    },
  },
  plural: {
    users: plural({
      1: '1 user',
      few: 'only {count} users',
      many: '{count} users',
    }),
  },
  select: {
    categories: select({
      all: 'All categories',
      test: 'Test category',
      null: 'None',
    }),
  },
};
