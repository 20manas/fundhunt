<script lang="ts">
  import {SvelteSet} from 'svelte/reactivity';
  import {toStore} from 'svelte/store';

  import Checkbox from '$components/Checkbox.svelte';
  import Loader from '$components/Loader.svelte';
  import {runAfterPaint} from '$lib/events';
  import {EFundType, type TFund} from '$types/funds';

  import Chart from './Chart.svelte';
  import FundSelector from './FundSelector.svelte';
  import logo from './logo.webp';
  import {getStats, type TStatsRequestData} from './stats.svelte';

  const PERIODS = [1, 3, 5, 7, 10] as const;
  let selectedPeriods = $state<Set<number>>(new SvelteSet([3, 5]));
  let orderedFunds = $state<TFund[]>([]);
  let showAggregates = $state(false);

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

  const statsRequestDataStore = toStore(() => statsRequestDataDeferred);
  const statsAPI = getStats(statsRequestDataStore);

  let mfTitles = $state<Array<{value: string; title: string}>>([]);

  $effect(() => {
    mfTitles = orderedFunds.filter(fund => fund.type === EFundType.MutualFund);

    $statsAPI.data;
  });
</script>

{#if $statsAPI.isLoading}
  <div class="global-loader-wrapper">
    <Loader />
  </div>
{/if}

<section>
  <header>
    <a href="/">
      <img src={logo} class="logo" />
    </a>
    <p>Compare and analyze Mutual Funds and Indexes with useful metrics!</p>
  </header>

  <FundSelector
    {mfTitles}
    setOrderedFunds={(funds: TFund[]) => {
      orderedFunds = funds;
    }}
  />

  <div class="periods">
    <h2>Rolling Periods</h2>
    <div class="periods-list">
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
  </div>

  <div class="options">
    <h2>Options</h2>
    <Checkbox
      isChecked={showAggregates}
      onChange={isChecked => {
        showAggregates = isChecked;
      }}>Show Aggregate Stats: Min, Average, Median, Max and Standard Deviation</Checkbox
    >
  </div>

  {#each $statsAPI.data as stats}
    <article class="chart-container">
      <Chart title={`${stats.period}-Year Rolling XIRR of SIP`} {showAggregates} data={stats.list} />
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

    @include mixins.for-mobile {
      gap: 20px;
      padding: 20px;
    }
  }

  header {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;

    p {
      font-style: italic;
      width: 250px;
      color: lightgrey;

      @include mixins.for-mobile {
        width: 180px;
        font-size: 12px;
      }
    }
  }

  .logo {
    width: 200px;

    @include mixins.for-mobile {
      width: 150px;
    }
  }

  .global-loader-wrapper {
    position: fixed;
    right: 30px;
    top: 20px;
    z-index: 10;
  }

  .periods {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 600px;
    max-width: 100%;
  }

  .periods-list {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 600px;
    max-width: 100%;
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 30px;
    width: 100%;

    @include mixins.for-mobile {
      padding: 20px 0;
    }
  }
</style>
