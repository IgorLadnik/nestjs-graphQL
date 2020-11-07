import { ConfigService } from 'config-lib';

export const isAuthOn = new ConfigService().getBool('IS_AUTH_ON');
export const isTlsOn = new ConfigService().getBool('IS_TLS_ON');
export const isGqlFromWeb = new ConfigService().getBool('IS_GQL_FROM_WEB');
export const isFetchFromSql = new ConfigService().getBool('IS_FETCH_FROM_SQL');
