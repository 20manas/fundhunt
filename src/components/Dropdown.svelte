<script lang="ts" generics="Value extends string | number, Data">
  import {clsx} from 'clsx';
  import Fuse, {type IFuseOptions} from 'fuse.js';
  import * as Ri from 'radashi';
  import type {Snippet} from 'svelte';

  import Checkbox from '$components/Checkbox.svelte';
  import Loader from '$components/Loader.svelte';
  import {clickOutside} from '$lib/dom';
  import {runAfterPaint} from '$lib/events';
  import {EImage} from '$lib/images';
  import {isNotUndefined} from '$lib/type';

  interface tListItem<V, D> {
    value: V;
    data: D;
    search?: string;
    isDisabled?: boolean;
  }

  const FUSE_OPTIONS: IFuseOptions<tListItem<unknown, unknown>> = {
    keys: ['search'],
    useExtendedSearch: true,
    // threshold: 0.6,
  };

  interface tDropdownProps<V, D> {
    label?: string;
    placeholder?: string;
    row: Snippet<[D]>;
    data: Array<tListItem<V, D>>;
    hideSearch?: boolean;
    width?: number | 'auto';
    isLoading?: boolean;
    isDisabled?: boolean;
    values: Set<V>;
    setQuery: (query: string) => unknown;
  }

  let {values = $bindable(), ...props}: tDropdownProps<Value, Data> = $props();
  let show = $state(false);
  let fuse = $derived(new Fuse(props.data, FUSE_OPTIONS));
  let query = $state('');
  let queryDebounced = $state('');

  let filteredItems = $derived.by(() => {
    if (props.hideSearch) return props.data;

    const data = queryDebounced !== '' ? fuse.search(queryDebounced).map(({item}) => item) : props.data;

    return data.slice(0, 500);
  });

  let inputEl: HTMLInputElement;

  const onClick = (value: Value) => {
    if (values.has(value)) {
      values.delete(value);
    } else {
      values.add(value);
    }
  };

  const updateQueryDebounced = Ri.debounce({delay: 400}, (newQuery: string) => {
    queryDebounced = newQuery;
  });

  $effect(() => {
    updateQueryDebounced(query);
  });

  $effect(() => {
    props.setQuery(queryDebounced);
  });

  $effect(() => {
    if (props.hideSearch) {
      query = '';
      return;
    }

    if (show) {
      inputEl.focus();
    } else {
      inputEl.blur();
    }
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === '/' && document.activeElement !== inputEl) {
      show = true;
      ev.preventDefault();
      return;
    }

    if (ev.key === 'Escape' && document.activeElement === inputEl) {
      if (query.length > 0) {
        query = '';
      } else {
        show = false;
      }
    }
  });
</script>

<div
  class="container"
  use:clickOutside={() => {
    show = false;
  }}
>
  {#if isNotUndefined(props.label)}
    <label class="label">{props.label}</label>
  {/if}
  <span
    class={clsx('box', props.isDisabled && '__disabled')}
    onclick={() => {
      if (!props.isDisabled) show = !show;
    }}
  >
    <input
      bind:this={inputEl}
      type="text"
      class={clsx('input', {['__readOnly']: props.hideSearch ?? props.isDisabled})}
      placeholder={props.placeholder}
      value={show ? query : ''}
      oninput={ev => {
        query = (ev.target as HTMLInputElement).value;
      }}
      onkeydown={ev => {
        if (ev.key !== 'Enter') return;

        updateQueryDebounced.flush((ev.target as HTMLInputElement).value);

        runAfterPaint(() => {
          if (filteredItems.length > 0) onClick(filteredItems[0].value);
        });
      }}
      onclick={ev => {
        if (props.hideSearch) return;
        ev.stopPropagation();
        show = true;
      }}
    />
    {#if show && query.length > 0}
      <img
        src={EImage.Cross}
        width={15}
        height={15}
        alt="Clear Text"
        class="cross"
        onmousedown={ev => {
          ev.preventDefault();

          query = '';
          updateQueryDebounced.flush('');
        }}
      />
    {/if}
    <img class="arrow" src={EImage.DropdownArrow} width={15} height={15} alt="" />
  </span>
  {#if (props.isLoading || props.data.length > 0) && show}
    <ul class="list">
      {#if props.isLoading}
        <div class="loader-container">
          <Loader autoMargins />
        </div>
      {:else if filteredItems.length === 0}
        <li class="notFoundText">No match found for &quot;{queryDebounced}&quot;</li>
      {:else}
        {#each filteredItems as item}
          <li
            class={clsx('item', item.isDisabled && '__disabled')}
            onclick={ev => {
              ev.preventDefault();
              onClick(item.value);
            }}
          >
            <Checkbox isChecked={values.has(item.value)} isDisabled={item.isDisabled} class="Dropdown_checkbox"
              >{@render props.row(item.data)}</Checkbox
            >
          </li>
        {/each}
      {/if}
    </ul>
  {/if}
</div>

<style lang="scss">
  $width: 600px;

  .container {
    position: relative;
    cursor: default;
    width: $width;
    margin: 0 auto;
  }

  .box {
    display: flex;
    gap: 20px;
    align-items: center;
    background-color: rgb(50 50 50);
    border-radius: 10px;
    padding: 20px;
    height: 60px;
    width: 100%;
    font-size: 20px;

    &.__disabled {
      filter: saturate(75%) brightness(90%);
      cursor: not-allowed;
    }
  }

  .input {
    background-color: transparent;
    border: none;
    outline: 0;
    width: 100%;

    &::placeholder {
      color: rgb(255 255 255 / 40%);
    }

    &.__readOnly {
      cursor: default;
      pointer-events: none;
    }
  }

  .cross {
    opacity: 0.4;
  }

  .loader-container {
    margin: 40px auto;
  }

  .list {
    position: absolute;
    background-color: rgb(50 50 50);

    /* padding: 20px; */
    padding: 10px 0;
    border-radius: 10px;
    flex-direction: column;
    width: 100%;
    margin: 10px 0 0;
    box-shadow: 0 15px 34px rgb(0 0 0 / 25%);
    max-height: 300px;
    overflow: auto;
    z-index: 5;
  }

  .item {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 20px;

    &:first-of-type {
      margin: 0;
    }

    &.__disabled {
      color: rgb(255 255 255 / 40%);
      pointer-events: none;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    :global(.Dropdown_checkbox) {
      cursor: default;
    }
  }

  .notFoundText {
    padding: 10px 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-style: italic;
  }
</style>
