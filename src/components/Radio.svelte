<script lang="ts">
  import type {Snippet} from 'svelte';
  import type {ChangeEventHandler} from 'svelte/elements';
  interface tProps {
    value?: string | number;
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

<label>
  <input
    type="radio"
    value={props.value}
    checked={props.isChecked}
    {onchange}
    disabled={props.isDisabled}
    readOnly={props.isReadonly}
    hidden
  />
  <div class="outer-circle">
    <div class="inner-circle"></div>
  </div>
  {@render props.children()}
</label>

<style lang="scss">
  label {
    display: flex;
    gap: 10px;
  }

  .outer-circle {
    width: 20px;
    height: 20px;
    border: solid 2px white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    input:checked ~ & {
      border-color: #3cb49b;
    }

    .inner-circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #3cb49b;
      opacity: 0;

      input:checked ~ & {
        opacity: 1;
      }
    }
  }
</style>
