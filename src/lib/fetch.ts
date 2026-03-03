import ky, {type Options} from 'ky';
import * as Ri from 'radashi';

import {isNotUndefined} from './type';

const KY_DEFAULT_CONFIG: Options = {
  retry: 0,
  timeout: false,
};

export const kyGet = <RespData>(url: string, params?: Record<string, unknown>, options?: Options) => {
  const stringParams = isNotUndefined(params)
    ? Ri.mapEntries<string, unknown, string, string>(Ri.shake(params), (key, value) => [
        key,
        Ri.isObject(value) ? JSON.stringify(value) : String(value),
      ])
    : undefined;

  return ky.get(url, {...KY_DEFAULT_CONFIG, searchParams: stringParams, ...options}).json<RespData>();
};

export type TQueryKey<ReqParams = unknown> = Readonly<[string, ReqParams | undefined, Options | undefined]>;

export const kyGetFetcher = <RespData, ReqParams extends Record<string, unknown> | undefined = undefined>({
  queryKey,
  signal,
}: {
  queryKey: TQueryKey<ReqParams>;
  signal: AbortSignal;
}) => {
  const [url, params, options] = queryKey;

  return kyGet<RespData>(url, params, {signal, ...options});
};
