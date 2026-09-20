import * as migration_20260918_120548_add_post_search_trigram from './20260918_120548_add_post_search_trigram';

export const migrations = [
  {
    up: migration_20260918_120548_add_post_search_trigram.up,
    down: migration_20260918_120548_add_post_search_trigram.down,
    name: '20260918_120548_add_post_search_trigram'
  },
];
