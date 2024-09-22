<script lang="ts">
  import {percentageFormatter} from '$lib/format';
  import {isNotNull} from '$lib/type';

  interface tItem {
    name: string;
    color: string;
    value: number | null;
  }

  interface tProps {
    data: tItem[];
  }

  let props: tProps = $props();
</script>

{#snippet Item(item: tItem)}
  <li>
    <div class="container">
      <span class="color" style="--color: {item.color}"></span>
      <span class="fund-name" title={item.name}>{item.name}</span>
    </div>
    <span class="value">
      {#if isNotNull(item.value)}
        {percentageFormatter(item.value)}
      {/if}
    </span>
  </li>
{/snippet}

<ul>
  {#each props.data as entry}
    {@render Item(entry)}
  {/each}
</ul>

<style lang="scss">
  li {
    display: flex;
    gap: 10px;
    flex-direction: column;
    line-height: normal;
    padding: 15px;
    border: 1px solid rgb(50 50 50);
    border-left: none;
    border-right: none;
    min-width: 100px;
    max-width: 300px;
  }

  .color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 5px;
    display: inline-block;
    background-color: var(--color);
    flex-shrink: 0;
  }

  .fund-name {
    text-wrap: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .container {
    display: flex;
    gap: 5px;
  }

  .value {
    height: 14px;
    font-weight: 600;
    text-align: center;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
  }
</style>
