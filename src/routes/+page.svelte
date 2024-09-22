<script lang="ts">
  import {SvelteMap, SvelteSet} from 'svelte/reactivity';
  import {toStore} from 'svelte/store';

  import Checkbox from '$components/Checkbox.svelte';
  import DraggableList from '$components/DraggableList.svelte';
  import Dropdown from '$components/Dropdown.svelte';
  import Loader from '$components/Loader.svelte';
  import {runAfterPaint} from '$lib/events';
  import {isNotUndefined, isNullish} from '$lib/type';
  import {type TFund} from '$types/funds';

  import Chart from './Chart.svelte';
  import {getIndexFundList, queryMFApi} from './funds.svelte';
  import {getStats, type TStatsRequestData} from './stats.svelte';

  let query = $state('');

  const fundListAPI = getIndexFundList();

  const queryStore = toStore(() => query);
  const mfAPI = queryMFApi(queryStore);

  const PERIODS = [1, 3, 5, 7, 10] as const;
  let selectedPeriods = $state<Set<number>>(new SvelteSet([3, 5]));
  let selectedFundValues = $state<Set<string>>(new SvelteSet()); // managed by dropdown
  let selectedFundValuesOrdered = $state<string[]>([]); // ordered list managed by draggable list
  let selectedFundsMap = $state<Map<string, TFund>>(new SvelteMap());

  const getSelectedFunds = (selectedFundValues: string[]) =>
    selectedFundValues.map(f => selectedFundsMap.get(f)).filter(isNotUndefined);

  let statsRequestData: TStatsRequestData = $derived.by(() => {
    if (isNullish($fundListAPI.data) || $fundListAPI.data.length === 0) return [];

    const fundList = getSelectedFunds(selectedFundValuesOrdered);

    return PERIODS.filter(per => selectedPeriods.has(per)).map(period => ({
      period,
      list: fundList,
    }));
  });

  let statsRequestDataDeferred = $state<typeof statsRequestData>([]);

  $effect(() => {
    const fn = (data: typeof statsRequestData) =>
      requestIdleCallback(() => {
        runAfterPaint(() => {
          statsRequestDataDeferred = data;
        });
      });

    fn(statsRequestData);
  });

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

  const stsatsRequestDataStore = toStore(() => statsRequestDataDeferred);
  const statsAPI = getStats(stsatsRequestDataStore);
</script>

{#if $statsAPI.isLoading}
  <div class="global-loader-wrapper">
    <Loader />
  </div>
{/if}

<section>
  <header>
    <h1><span>F</span>und<span>H</span>unt</h1>
    <p>Compare and analyze Mutual Funds and Indexes with useful metrics!</p>
  </header>
  {#snippet DropdownItem(fund: TFund)}
    <div class="dropdown-item">
      <span class="tag {fund.type}">{fund.type.toUpperCase()}</span>
      <span class="dropdown-text">{fund.title}</span>
    </div>
  {/snippet}
  <Dropdown
    setQuery={newQuery => {
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
    setList={list => {
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
  <div class="periods">
    <h2>Rolling Periods</h2>
    {#each PERIODS as period}
      <Checkbox
        isChecked={selectedPeriods.has(period)}
        onChange={isChecked => {
          if (isChecked) {
            selectedPeriods.add(period);
          } else {
            selectedPeriods.delete(period);
          }
        }}>{period} Year</Checkbox
      >
    {/each}
  </div>
  {#each $statsAPI.data as stats}
    <article class="chart-container">
      <h2>{stats.period}-Year Rolling XIRR for SIP</h2>
      <Chart data={stats.list} />
    </article>
  {/each}
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    padding: 30px;
  }

  header {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;

    h1 {
      font-size: 48px;
      font-weight: 100;
      text-transform: uppercase;

      span {
        color: #3cb49b;
        font-weight: 600;
        font-size: 72px;
      }
    }

    p {
      font-size: 16px;
      font-style: italic;
      width: 250px;
    }
  }

  .global-loader-wrapper {
    position: fixed;
    right: 30px;
    top: 20px;
  }

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

  .periods {
    display: flex;
    flex-direction: column;
    gap: 30px;
    min-width: 600px;
  }

  h2 {
    display: flex;
    gap: 20px;
    height: 30px;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 20px;
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 30px;
    width: 100%;
  }
</style>
