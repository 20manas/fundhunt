<script lang="ts">
  import {clsx} from 'clsx';
  import type {Snippet} from 'svelte';
  import type {ChangeEventHandler} from 'svelte/elements';
  interface tProps {
    value?: string | number;
    defaultChecked?: boolean;
    isChecked?: boolean;
    isDisabled?: boolean;
    onChange?: (isChecked: boolean) => unknown;
    class?: string;
    isReadonly?: boolean;
    children: Snippet;
  }

  let props: tProps = $props();

  const onchange: ChangeEventHandler<HTMLInputElement> = ev => {
    if (props.isReadonly || props.isDisabled) return;
    props.onChange?.(ev.currentTarget.checked);
  };
</script>

<label class={clsx('label', props.isDisabled && '__disabled', props.class)}>
  <input
    type="checkbox"
    value={props.value}
    checked={props.isChecked}
    {onchange}
    class={clsx('checkbox', props.isChecked && '__checked', props.isDisabled && '__disabled')}
    disabled={props.isDisabled}
    readOnly={props.isReadonly}
  />
  {@render props.children()}
</label>

<style lang="scss">
  .label {
    display: flex;
    align-items: center;
    gap: 20px;
    cursor: pointer;

    &.__disabled {
      text-decoration: line-through;
      cursor: auto;
      filter: saturate(50%) brightness(75%);
    }
  }

  $check-url: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjM2NiNDliIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEyIiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0xMiwyQTEwLDEwLDAsMSwwLDIyLDEyLDEwLDEwLDAsMCwwLDEyLDJabTUuNjc2LDguMjM3LTYsNS41YTEsMSwwLDAsMS0xLjM4My0uMDNsLTMtM2ExLDEsMCwxLDEsMS40MTQtMS40MTRsMi4zMjMsMi4zMjMsNS4yOTQtNC44NTNhMSwxLDAsMSwxLDEuMzUyLDEuNDc0WiIvPgo8L3N2Zz4K';

  .checkbox {
    appearance: none;
    outline: none;
    cursor: inherit;
    height: 20px;
    width: 20px;
    background-color: transparent;
    border: 2px solid #fff;
    border-radius: 50%;
    flex-shrink: 0;

    &.__checked {
      border: none;
      background: url($check-url) center center no-repeat;
      background-size: contain;
    }

    &.__disabled {
      cursor: not-allowed;
    }
  }
</style>
