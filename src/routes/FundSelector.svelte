<script lang="ts">
  import {SvelteMap, SvelteSet} from 'svelte/reactivity';
  import {toStore} from 'svelte/store';

  import DraggableList from '$components/DraggableList.svelte';
  import Dropdown from '$components/Dropdown.svelte';
  import {isNotUndefined, isNullish} from '$lib/type';
  import {type TFund} from '$types/funds';

  import {getIndexFundList, queryMFApi} from './funds.svelte';

  interface tProps {
    setOrderedFunds: (funds: TFund[]) => unknown;
  }

  let props: tProps = $props();

  let query = $state('');
  const queryStore = toStore(() => query);

  const fundListAPI = getIndexFundList();
  const mfAPI = queryMFApi(queryStore);

  let selectedFundValues = $state<Set<string>>(new SvelteSet()); // managed by dropdown
  let selectedFundValuesOrdered = $state<string[]>([]); // ordered list managed by draggable list
  let selectedFundsMap = $state<Map<string, TFund>>(new SvelteMap());

  const getSelectedFunds = (selectedFundValues: string[]) =>
    selectedFundValues.map(f => selectedFundsMap.get(f)).filter(isNotUndefined);

  $effect(() => {
    if (isNullish($fundListAPI.data)) return;

    for (const fund of $fundListAPI.data.concat($mfAPI.data ?? [])) {
      if (selectedFundValues.has(fund.value) && !selectedFundsMap.has(fund.value)) {
        selectedFundsMap.set(fund.value, fund);
      }
    }
  });

  $effect(() => {
    for (const item of selectedFundValues.values()) {
      if (!selectedFundValuesOrdered.includes(item)) selectedFundValuesOrdered.push(item);
    }

    for (let i = 0; i < selectedFundValuesOrdered.length; i++) {
      if (!selectedFundValues.has(selectedFundValuesOrdered[i])) {
        selectedFundValuesOrdered.splice(i, 1);
        i--;
      }
    }
  });

  $effect(() => {
    props.setOrderedFunds(getSelectedFunds(Array.from(selectedFundValuesOrdered)));
  });
</script>

{#snippet DropdownItem(fund: TFund)}
  <div class="dropdown-item">
    <span class="tag {fund.type}">{fund.type.toUpperCase()}</span>
    <span class="dropdown-text">{fund.title}</span>
  </div>
{/snippet}

<Dropdown
  setQuery={(newQuery: string) => {
    query = newQuery;
  }}
  placeholder="Search for Mutual Funds and Indexes"
  bind:values={selectedFundValues}
  isLoading={$mfAPI.isLoading || $fundListAPI.isLoading}
  row={DropdownItem}
  data={$fundListAPI.data
    ?.concat($mfAPI.data ?? [])
    .map(fund => ({value: fund.value, data: fund, search: fund.title})) ?? []}
/>

<DraggableList
  list={getSelectedFunds(Array.from(selectedFundValues))}
  setList={(list: string[]) => {
    if (list.length < selectedFundValues.size) {
      for (const item of selectedFundValues.values()) {
        if (!list.includes(item)) selectedFundValues.delete(item);
      }
    } else if (list.length > selectedFundValues.size) {
      for (const item of list) {
        if (!selectedFundValues.has(item)) selectedFundValues.add(item);
      }
    }

    selectedFundValuesOrdered = list;
  }}
/>

<style lang="scss">
  .dropdown-item {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .tag {
    width: 60px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 700;

    &.mf {
      background-color: #f58231;
    }

    &.index {
      background-color: #4363d8;
    }
  }

  .dropdown-text {
    white-space: wrap;
  }
</style>
