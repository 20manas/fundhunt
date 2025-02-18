<script lang="ts">
  import {SvelteSet} from 'svelte/reactivity';
  import {toStore} from 'svelte/store';

  import Checkbox from '$components/Checkbox.svelte';
  import Loader from '$components/Loader.svelte';
  import {runAfterPaint} from '$lib/events';
  import {type TFund} from '$types/funds';

  import Chart from './Chart.svelte';
  import FundSelector from './FundSelector.svelte';
  import logo from './logo.webp';
  import {getStats, type TStatsRequestData} from './stats.svelte';

  const PERIODS = [1, 3, 5, 7, 10] as const;
  let selectedPeriods = $state<Set<number>>(new SvelteSet([3, 5]));
  let orderedFunds = $state<TFund[]>([]);

  let statsRequestData: TStatsRequestData = $derived.by(() =>
    PERIODS.filter(per => selectedPeriods.has(per)).map(period => ({
      period,
      list: orderedFunds,
    })),
  );

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
    <img src={logo} />
    <p>Compare and analyze Mutual Funds and Indexes with useful metrics!</p>
  </header>

  <FundSelector
    setOrderedFunds={(funds: TFund[]) => {
      orderedFunds = funds;
    }}
  />

  <div class="periods">
    <h2>Rolling Periods</h2>
    {#each PERIODS as period}
      <Checkbox
        isChecked={selectedPeriods.has(period)}
        onChange={(isChecked: boolean) => {
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

  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 30px;
    width: 100%;
  }
</style>
