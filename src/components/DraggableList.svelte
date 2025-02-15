<script lang="ts" generics="Data, Value extends string | number">
  import {Sortable, Plugins} from '@shopify/draggable';
  import type {Snippet} from 'svelte';

  import {EImage} from '$lib/images';

  interface tProps<Data, Value> {
    content: Snippet<[Data]>;
    list: Array<{data: Data; value: Value}>;
    setList: (values: Value[]) => unknown;
  }

  let props: tProps<Data, Value> = $props();

  const getList = () => {
    const elList = Array.from(
      document.querySelectorAll('[data-draggable-value]:not(.draggable-mirror,.draggable--original)').values(),
    );

    return elList.map(el => el.getAttribute('data-draggable-value') ?? '') as Value[];
  };

  const onClose = (value: Value) => {
    props.setList(getList().filter(val => val !== value));
  };

  const addSortable = (element: HTMLElement) => {
    const sortable = new Sortable(element, {
      draggable: 'li.item',
      sortAnimation: {
        duration: 300,
      },
      plugins: [Plugins.SortAnimation],
    });

    // sortable.on('sortable:start', ev => console.log('sortable:start', ev));
    // sortable.on('sortable:sort', ev => console.log('sortable:sort', ev));
    // sortable.on('sortable:sorted', ev => console.log('sortable:sorted', ev));
    sortable.on('sortable:stop', ev => {
      if (ev.oldIndex === ev.newIndex) return;
      const newList = getList();

      props.setList(newList);
    });
  };
</script>

<ul use:addSortable>
  {#each props.list as item}
    <li class="item" data-draggable-value={item.value}>
      {@render props.content(item.data)}
      <img
        src={EImage.Drag}
        width={15}
        height={15}
        alt="Drag to rearrange"
        title="Drag and drop to re-arrange order"
        class="drag"
      />
      <img
        src={EImage.Cross}
        width={10}
        height={10}
        alt="Remove"
        class="close"
        onmousedown={() => onClose(item.value)}
      />
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  li {
    width: 600px;
    background-color: rgb(20 20 20);
    border: 1px solid rgb(100 100 100);
    box-shadow: 0 0 10px rgb(100 100 100);
    border-radius: 10px;
    font-size: 16px;
    min-height: 40px;
    display: flex;
    gap: 30px;
    align-items: center;
    padding: 15px 20px;
  }

  .title {
    width: 100%;
  }

  .drag {
    cursor: move;
    cursor: grab;
    user-select: none;
  }

  .close {
    cursor: pointer;
    user-select: none;
  }
</style>
