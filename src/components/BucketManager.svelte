<script lang="ts">
  import BucketPopup from '$components/BucketPopup.svelte';
  import {
    applyUrlParams,
    getBucketById,
    getBuckets,
    getCurrentUrlParams,
    getSelectedBucketIdFromUrl,
    hasBucketName,
    normalizeBucketComparableParams,
    saveBucket,
    setSelectedBucketIdInUrl,
    updateBucket,
    type TBucket,
  } from '$lib/buckets';
  import {isNullish} from '$lib/type';

  import {page} from '$app/stores';

  interface tProps {
    canSave: boolean;
  }

  let props: tProps = $props();

  let showBucketPopup = $state(false);
  let showSaveBucketPopup = $state(false);
  let newBucketName = $state('');
  let selectedBucket = $state<TBucket | null>(null);
  let loadedBucket = $state<TBucket | null>(null);

  const currentParamsStr = $derived(normalizeBucketComparableParams($page.url.searchParams));
  const savedParamsStr = $derived(
    loadedBucket ? normalizeBucketComparableParams(new URLSearchParams(loadedBucket.params)) : null,
  );
  const hasUnsavedChanges = $derived(loadedBucket && currentParamsStr !== savedParamsStr);

  const handleUpdateBucket = () => {
    if (!loadedBucket) return;

    const params = getCurrentUrlParams();
    updateBucket(loadedBucket.id, params);
    loadedBucket = {...loadedBucket, params};
  };

  const handleSaveBucket = () => {
    const bucketName = newBucketName.trim();
    if (!bucketName) return;

    if (hasBucketName(bucketName, getBuckets())) return;

    const params = getCurrentUrlParams();
    const bucket = saveBucket(bucketName, params);
    setSelectedBucketIdInUrl(bucket.id);
    selectedBucket = bucket;
    loadedBucket = bucket;
    newBucketName = '';
    showSaveBucketPopup = false;
  };

  const handleLoadBucket = (bucket: TBucket) => {
    setSelectedBucketIdInUrl(bucket.id);
    applyUrlParams(bucket.params);
    selectedBucket = bucket;
    loadedBucket = bucket;
  };

  const handleSelectBucket = (bucket: TBucket | null) => {
    selectedBucket = bucket;
  };

  const handleLoadedBucketDeleted = () => {
    setSelectedBucketIdInUrl(null);
    selectedBucket = null;
    loadedBucket = null;
  };

  $effect(() => {
    const bucketId = getSelectedBucketIdFromUrl();
    if (isNullish(bucketId)) return;

    const bucket = getBucketById(bucketId);
    if (!bucket) return;

    selectedBucket = bucket;
    loadedBucket = bucket;
  });
</script>

<div class="bucket-box">
  {#if loadedBucket}
    <div class="bucket-indicator">
      <span>Loaded: <span class="bucket-name">{loadedBucket.name}</span></span>
      {#if hasUnsavedChanges}
        <button class="btn-update" onclick={handleUpdateBucket}>Update</button>
      {/if}
    </div>
  {/if}
  {#if props.canSave && (!loadedBucket || hasUnsavedChanges)}
    <button class="btn-bucket" onclick={() => (showSaveBucketPopup = true)}>Save as Bucket</button>
  {/if}
  <button class="btn-bucket" onclick={() => (showBucketPopup = true)}>Manage Buckets</button>
</div>

<BucketPopup
  isOpen={showBucketPopup}
  onClose={() => (showBucketPopup = false)}
  {selectedBucket}
  onSelectBucket={handleSelectBucket}
  onLoadBucket={handleLoadBucket}
  loadedBucketId={loadedBucket?.id ?? null}
  onLoadedBucketDeleted={handleLoadedBucketDeleted}
/>

{#if showSaveBucketPopup}
  <div class="overlay" onclick={() => (showSaveBucketPopup = false)}>
    <div class="save-bucket-popup" onclick={e => e.stopPropagation()}>
      <h3>Save as Bucket</h3>
      <p class="description">
        A bucket is a collection of funds and selected configuration which gets saved in the browser so you can come
        back to use it later.
      </p>
      <input
        class="full-width"
        type="text"
        placeholder="Enter bucket name"
        bind:value={newBucketName}
        onkeydown={e => e.key === 'Enter' && handleSaveBucket()}
      />
      <div class="popup-actions">
        <button class="btn btn-secondary" onclick={() => (showSaveBucketPopup = false)}>Cancel</button>
        <button class="btn btn-primary" onclick={handleSaveBucket} disabled={!newBucketName.trim()}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .btn-bucket {
    background: #3cb49baa;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      opacity: 0.8;
    }
  }

  .bucket-box {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .bucket-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #2a2a2a;
    border: 1px solid #444;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 14px;
    color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .bucket-name {
      font-weight: 600;
      color: #3cb49b;
    }
  }

  .btn-update {
    background: #3cb49baa;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      opacity: 0.85;
      transform: translateY(-1px);
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .save-bucket-popup {
    background: #2a2a2a;
    border-radius: 12px;
    padding: 20px;
    width: 90%;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    h3 {
      margin: 0;
      color: #fff;
      font-size: 18px;
    }

    .description {
      color: #aaa;
      font-size: 13px;
      margin: 0;
      line-height: 1.4;
    }

    input {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #444;
      background: #1a1a1a;
      color: #fff;
      font-size: 14px;
      width: 100%;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #3cb49b;
      }
    }

    .popup-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        opacity: 0.8;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: #3cb49baa;
      color: #fff;
    }

    .btn-secondary {
      background: #555;
      color: #fff;
    }
  }
</style>
