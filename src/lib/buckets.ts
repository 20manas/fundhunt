import {isNotNullish, isNullish} from '$lib/type';

export interface TBucket {
  id: string;
  name: string;
  params: string;
  createdAt: number;
}

export const BUCKET_PARAM = 'bucket';

const STORAGE_KEY = 'fundhunt_buckets';

export const getBuckets = (): TBucket[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isNullish(stored)) return [];
  try {
    return JSON.parse(stored) as TBucket[];
  } catch {
    return [];
  }
};

export const getBucketById = (id: string): TBucket | null => {
  const buckets = getBuckets();
  return buckets.find(b => b.id === id) ?? null;
};

export const getSelectedBucketIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(BUCKET_PARAM);
};

export const setSelectedBucketIdInUrl = (id: string | null): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (isNotNullish(id)) {
    url.searchParams.set(BUCKET_PARAM, id);
  } else {
    url.searchParams.delete(BUCKET_PARAM);
  }
  window.history.replaceState({}, '', url.toString());
};

export const saveBucket = (name: string, params: string): TBucket => {
  const buckets = getBuckets();
  const newBucket: TBucket = {
    id: crypto.randomUUID(),
    name,
    params,
    createdAt: Date.now(),
  };
  buckets.push(newBucket);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  return newBucket;
};

export const updateBucket = (id: string, params: string): TBucket | null => {
  const buckets = getBuckets();
  const index = buckets.findIndex(b => b.id === id);
  if (index === -1) return null;
  buckets[index].params = params;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  return buckets[index];
};

export const renameBucket = (id: string, newName: string): TBucket | null => {
  const buckets = getBuckets();
  const index = buckets.findIndex(b => b.id === id);
  if (index === -1) return null;
  buckets[index].name = newName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));
  return buckets[index];
};

export const deleteBucket = (id: string): boolean => {
  const buckets = getBuckets();
  const filtered = buckets.filter(b => b.id !== id);
  if (filtered.length === buckets.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const hasBucketName = (name: string, buckets: TBucket[] = getBuckets()): boolean => {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return false;
  return buckets.some(bucket => bucket.name.trim().toLowerCase() === normalizedName);
};

export const normalizeBucketComparableParams = (searchParams: URLSearchParams): string => {
  const normalized: Record<string, string> = {};
  const keys = Array.from(searchParams.keys()).sort();
  for (const key of keys) {
    if (key === BUCKET_PARAM) continue;
    const values = searchParams.getAll(key).sort();
    normalized[key] = values.join(',');
  }
  return JSON.stringify(normalized);
};

export const getCurrentUrlParams = (): string => window.location.search;

export const applyUrlParams = (params: string): void => {
  const urlObj = new URL(window.location.href);
  const newParams = new URLSearchParams(params.startsWith('?') ? params : `?${params}`);

  const existingBucketId = urlObj.searchParams.get(BUCKET_PARAM);
  if (isNotNullish(existingBucketId)) {
    newParams.set(BUCKET_PARAM, existingBucketId);
  }

  urlObj.search = newParams.toString();
  window.history.pushState({}, '', urlObj.toString());
  window.location.reload();
};
