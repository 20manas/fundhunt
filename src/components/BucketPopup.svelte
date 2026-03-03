<script lang="ts">
  import {getBuckets, deleteBucket, renameBucket, getBucketById, type TBucket} from '$lib/buckets';

  interface tProps {
    isOpen: boolean;
    onClose: () => void;
    selectedBucket: TBucket | null;
    onSelectBucket: (bucket: TBucket | null) => void;
    onLoadBucket: (bucket: TBucket) => void;
    loadedBucketId: string | null;
    onLoadedBucketDeleted: () => void;
  }

  let props: tProps = $props();

  let buckets = $state<TBucket[]>([]);
  let renamingId = $state<string | null>(null);
  let newName = $state('');

  $effect(() => {
    if (props.isOpen) {
      buckets = getBuckets();
    }
  });

  const handleLoadBucket = (bucket: TBucket) => {
    props.onLoadBucket(bucket);
  };

  const handleDeleteBucket = (id: string, e: Event) => {
    e.stopPropagation();
    deleteBucket(id);
    buckets = getBuckets();
    if (props.selectedBucket?.id === id) {
      props.onSelectBucket(null);
    }
    if (props.loadedBucketId === id) {
      props.onLoadedBucketDeleted();
    }
  };

  const startRename = (bucket: TBucket, e: Event) => {
    e.stopPropagation();
    renamingId = bucket.id;
    newName = bucket.name;
  };

  const confirmRename = (id: string) => {
    if (!newName.trim()) return;
    renameBucket(id, newName.trim());
    buckets = getBuckets();
    const updated = getBucketById(id);
    if (updated && props.selectedBucket?.id === id) {
      props.onSelectBucket(updated);
    }
    renamingId = null;
    newName = '';
  };

  const cancelRename = () => {
    renamingId = null;
    newName = '';
  };
</script>

{#if props.isOpen}
  <div class="overlay" onclick={props.onClose}>
    <div class="popup" onclick={e => e.stopPropagation()}>
      <div class="header">
        <h2>Buckets</h2>
        <button class="close-btn" onclick={props.onClose}>&times;</button>
      </div>

      <div class="content">
        <p class="description">
          A bucket is a collection of funds and selected configuration which gets saved in the browser so you can come
          back to use it later.
        </p>

        {#if buckets.length === 0}
          <p class="empty-message">No buckets saved yet. Save your current selection as a bucket!</p>
        {:else}
          <ul class="bucket-list">
            {#each buckets as bucket (bucket.id)}
              <li
                class="bucket-item"
                class:selected={props.selectedBucket?.id === bucket.id}
                onclick={() => handleLoadBucket(bucket)}
              >
                {#if renamingId === bucket.id}
                  <input
                    class="rename-input"
                    type="text"
                    bind:value={newName}
                    onkeydown={e => e.key === 'Enter' && confirmRename(bucket.id)}
                    onclick={e => e.stopPropagation()}
                  />
                  <div class="bucket-actions">
                    <button class="btn btn-small btn-rename" onclick={() => confirmRename(bucket.id)}>Save</button>
                    <button
                      class="btn btn-small btn-secondary"
                      onclick={e => {
                        e.stopPropagation();
                        cancelRename();
                      }}>Cancel</button
                    >
                  </div>
                {:else}
                  <span class="bucket-name">{bucket.name}</span>
                  <div class="bucket-actions">
                    <button class="btn btn-small" onclick={e => startRename(bucket, e)}>Rename</button>
                    <button class="btn btn-small btn-danger" onclick={e => handleDeleteBucket(bucket.id, e)}
                      >Delete</button
                    >
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
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

  .popup {
    background: #2a2a2a;
    border-radius: 12px;
    width: 90%;
    max-width: 450px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #444;

    h2 {
      margin: 0;
      font-size: 20px;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 0;

    &:hover {
      opacity: 0.7;
    }
  }

  .content {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-small {
    padding: 4px 10px;
    font-size: 12px;
  }

  .btn-rename {
    background: #3cb49baa;
    color: #fff;
  }

  .btn-danger {
    background: #d84545;
    color: #fff;
  }

  .rename-input {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #3cb49b;
    background: #1a1a1a;
    color: #fff;
    font-size: 14px;
    flex: 1;
    max-width: 150px;

    &:focus {
      outline: none;
      border-color: #3cb49b;
    }
  }

  .bucket-actions {
    display: flex;
    gap: 6px;
  }

  .empty-message {
    text-align: center;
    color: #888;
    font-size: 14px;
    padding: 20px 0;
  }

  .description {
    color: #aaa;
    font-size: 13px;
    margin: 0 0 10px 0;
    line-height: 1.4;
  }

  .bucket-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bucket-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #333;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: #3a3a3a;
    }

    &.selected {
      background: #3cb49b1a;
      border: 1px solid #3cb49b;
    }
  }

  .bucket-name {
    font-size: 14px;
    color: #fff;
  }

  .bucket-actions {
    display: flex;
    gap: 8px;
  }
</style>
