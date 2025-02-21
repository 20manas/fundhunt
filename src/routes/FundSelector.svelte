<script lang="ts">
  import {SvelteMap, SvelteSet} from 'svelte/reactivity';
  import {get, toStore} from 'svelte/store';
  import {queryParam} from 'sveltekit-search-params';

  import Checkbox from '$components/Checkbox.svelte';
  import DraggableList from '$components/DraggableList.svelte';
  import Dropdown from '$components/Dropdown.svelte';
  import {isNotUndefined, isNull, isNullish} from '$lib/type';
  import {EFundType, type TFund} from '$types/funds';

  import {getIndexFundList, queryMFApi} from './funds.svelte';

  interface tProps {
    setOrderedFunds: (funds: TFund[]) => unknown;
  }

  let props: tProps = $props();

  const fundTypeTitles: Record<EFundType, string> = {
    [EFundType.Index]: 'Index',
    [EFundType.MutualFund]: 'MF',
  };

  const encodeFundList = (fundList: TFund[]) => {
    if (fundList.length === 0) return;

    return fundList.map(fund => [fund.type, fund.value, fund.title].map(encodeURIComponent).join('::')).join(',');
  };

  const decodeFundList = (str: string | null): TFund[] => {
    if (isNull(str)) return [];

    return str.split(',').map(part => {
      const [type, value, title] = part.split('::').map(decodeURIComponent) as [EFundType, string, string];

      return {type, value, title};
    });
  };

  let query = $state('');
  const queryStore = toStore(() => query);

  const isDirectGrowthInQuery = $derived(query.includes('direct') && query.includes('growth'));

  const queryParamsList = queryParam(
    'list',
    {
      encode: encodeFundList,
      decode: decodeFundList,
      defaultValue: [],
    },
    {debounceHistory: 100, pushHistory: false},
  );

  let selectedFundTypes = $state<Set<EFundType>>(new SvelteSet([EFundType.Index, EFundType.MutualFund]));

  const isMFSelected = toStore(() => selectedFundTypes.has(EFundType.MutualFund));

  const fundListAPI = getIndexFundList();
  const mfAPI = queryMFApi(isMFSelected, queryStore);

  const allFundsList = $derived.by(() => {
    let list: TFund[] = [];

    if (selectedFundTypes.has(EFundType.Index)) {
      list = list.concat($fundListAPI.data ?? []);
    }

    if (selectedFundTypes.has(EFundType.MutualFund)) {
      list = list.concat($mfAPI.data ?? []);
    }

    return list;
  });

  const defaultFunds = get(queryParamsList);
  const defaultValues = defaultFunds.map(f => f.value);

  let selectedFundValues = $state<Set<string>>(new SvelteSet(defaultValues)); // managed by dropdown
  let selectedFundValuesOrdered = $state<string[]>(defaultValues); // ordered list managed by draggable list
  let selectedFundsMap = $state<Map<string, TFund>>(new SvelteMap(defaultFunds.map(f => [f.value, f])));

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
    $queryParamsList = getSelectedFunds(selectedFundValuesOrdered);
    props.setOrderedFunds(getSelectedFunds(selectedFundValuesOrdered));
  });
</script>

{#snippet Tag(fundType: EFundType)}
  <span class="tag {fundType}">{fundTypeTitles[fundType].toUpperCase()}</span>
{/snippet}

{#snippet DropdownItem(fund: TFund)}
  <div class="dropdown-item">
    {@render Tag(fund.type)}
    <span class="dropdown-text">{fund.title}</span>
  </div>
{/snippet}

{#snippet DraggableListContent(fund: TFund)}
  <div class="draggable-list-content">
    {@render Tag(fund.type)}
    {fund.title}
  </div>
{/snippet}

<div class="container">
  <div class="action-bar">
    <Checkbox
      isChecked={selectedFundTypes.has(EFundType.Index)}
      onChange={isChecked =>
        isChecked ? selectedFundTypes.add(EFundType.Index) : selectedFundTypes.delete(EFundType.Index)}
      >Index Funds</Checkbox
    >
    <Checkbox
      isChecked={selectedFundTypes.has(EFundType.MutualFund)}
      onChange={isChecked =>
        isChecked ? selectedFundTypes.add(EFundType.MutualFund) : selectedFundTypes.delete(EFundType.MutualFund)}
      >Mutual Funds</Checkbox
    >

    <button
      disabled={isDirectGrowthInQuery}
      class="button"
      onclick={() => {
        query = query.replace('direct', '').replace('growth', '').replace(/\s+/, ' ').trim() + ' direct growth';
      }}>Add "direct growth"</button
    >
  </div>
  <Dropdown
    {query}
    setQuery={(newQuery: string) => {
      query = newQuery;
    }}
    placeholder="Search for Mutual Funds and Indexes"
    bind:values={selectedFundValues}
    isLoading={$mfAPI.isLoading || $fundListAPI.isLoading}
    row={DropdownItem}
    data={allFundsList.map(fund => ({value: fund.value, data: fund, search: fund.title}))}
  />
</div>

<DraggableList
  content={DraggableListContent}
  list={getSelectedFunds(Array.from(selectedFundValues)).map(f => ({data: f, value: f.value}))}
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
  .container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;
  }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 600px;
    max-width: 100%;

    @include mixins.for-mobile {
      font-size: 12px;
    }
  }

  .dropdown-item {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-left: 10px;
  }

  .tag {
    min-width: 60px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border-radius: 12.5px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;

    @include mixins.for-mobile {
      min-width: 50px;
      height: 20px;
      border-radius: 10px;
      font-size: 10px;
    }

    &.m {
      background-color: #f58231;
    }

    &.i {
      background-color: #4363d8;
    }
  }

  .dropdown-text {
    white-space: wrap;
  }

  .draggable-list-content {
    width: 100%;
    display: flex;
    gap: 10px;
    align-items: center;
  }
</style>
