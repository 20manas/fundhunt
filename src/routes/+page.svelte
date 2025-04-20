<script lang="ts">
  import {SvelteSet} from 'svelte/reactivity';
  import {get, toStore} from 'svelte/store';
  import {queryParam} from 'sveltekit-search-params';

  import Checkbox from '$components/Checkbox.svelte';
  import Loader from '$components/Loader.svelte';
  import Radio from '$components/Radio.svelte';
  import {runAfterPaint} from '$lib/events';
  import {EFundType, type TFund} from '$types/funds';
  import {EMetric} from '$types/metrics';

  import Chart from './Chart.svelte';
  import FundSelector from './FundSelector.svelte';
  import logo from './logo.webp';
  import {getStats, type TStatsRequestData} from './stats.svelte';

  const PERIODS = [1, 3, 5, 7, 10] as const;

  const metricTitles: Record<EMetric, string> = {
    [EMetric.Xirr]: 'Rolling XIRR of SIP',
    [EMetric.SdMonthly]: 'Rolling Standard Deviation of Monthly Returns',
    [EMetric.SdDaily]: 'Rolling Standard Deviation of Daily Returns',
    [EMetric.DdMonthly]: 'Rolling Downside Deviation of Monthly Returns',
    [EMetric.DdDaily]: 'Rolling Downside Deviation of Daily Returns',
    [EMetric.Sharpe]: 'Rolling Sharpe Ratio',
    [EMetric.Sortino]: 'Rolling Sortino Ratio',
  };

  const encodePeriod = (periods: number[]) => {
    const str = encodeURIComponent(periods.join(','));

    if (str.length === 0) return;

    return str;
  };

  const decodePeriod = (str: string | null) =>
    decodeURIComponent(str ?? '')
      .split(',')
      .map(num => parseInt(num));

  const selectedPeriodsQuery = queryParam(
    'periods',
    {
      encode: encodePeriod,
      decode: decodePeriod,
      defaultValue: [3, 5],
    },
    {pushHistory: false},
  );

  let selectedPeriods = $state<Set<number>>(new SvelteSet(get(selectedPeriodsQuery)));

  let selectedMetric = $state<EMetric>(EMetric.Xirr);

  const showAggregatesQuery = queryParam('agg', {
    encode: (show: boolean) => (show ? 'true' : undefined),
    decode: (str: string | null) => str === 'true',
    defaultValue: false,
  });
  let showAggregates = $state(get(showAggregatesQuery));

  let orderedFunds = $state<TFund[]>([]);

  let statsRequestData: TStatsRequestData = $derived({
    metric: selectedMetric,
    periods: PERIODS.filter(period => selectedPeriods.has(period)),
    funds: orderedFunds,
  });

  let statsRequestDataDeferred = $state<typeof statsRequestData>(statsRequestData);

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
  let isStatsAPIInitialized = $state(false);

  let mfTitles = $state<Array<{value: string; title: string}>>([]);

  $effect(() => {
    mfTitles = orderedFunds.filter(fund => fund.type === EFundType.MutualFund);

    // console.info($statsAPI.data.map(item => item.list.map(e => e.data.map(x => x.value))));
    $statsAPI.data;
  });

  $effect(() => {
    $selectedPeriodsQuery = Array.from(selectedPeriods);
  });

  $effect(() => {
    $showAggregatesQuery = showAggregates;
  });

  $effect(() => {
    if (!$statsAPI.someSuccess || isStatsAPIInitialized) return;
    console.log('Stats API success', $statsAPI.someSuccess, $statsAPI.isLoading, $statsAPI.isFetching);

    isStatsAPIInitialized = true;

    setTimeout(() => {
      document.getElementsByClassName('chart-container')[0].scrollIntoView({behavior: 'smooth'});
    }, 500);
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
    <h2>Metrics</h2>
    <div class="periods-list">
      <Radio
        isChecked={selectedMetric === EMetric.Xirr}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.Xirr;
          }
        }}>Rolling XIRR of SIP</Radio
      >
      <Radio
        isChecked={selectedMetric === EMetric.SdMonthly || selectedMetric === EMetric.SdDaily}
        onChange={(isChecked: boolean) => {
          if (isChecked && selectedMetric !== EMetric.SdMonthly && selectedMetric !== EMetric.SdDaily) {
            selectedMetric = EMetric.SdMonthly;
          }
        }}>Rolling Standard Deviation</Radio
      >
      <Radio
        isChecked={selectedMetric === EMetric.DdMonthly || selectedMetric === EMetric.DdDaily}
        onChange={(isChecked: boolean) => {
          if (isChecked && selectedMetric !== EMetric.DdMonthly && selectedMetric !== EMetric.DdDaily) {
            selectedMetric = EMetric.DdMonthly;
          }
        }}>Rolling Downside Deviation</Radio
      >
      <Radio
        isChecked={selectedMetric === EMetric.Sharpe}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.Sharpe;
          }
        }}>Rolling Sharpe Ratio</Radio
      >
      <Radio
        isChecked={selectedMetric === EMetric.Sortino}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.Sortino;
          }
        }}>Rolling Sortino Ratio</Radio
      >
    </div>
  </div>
  {#if selectedMetric === EMetric.SdDaily || selectedMetric === EMetric.SdMonthly}
    <div class="periods">
      <h3>Standard Deviation Options</h3>
      <Radio
        isChecked={selectedMetric === EMetric.SdMonthly}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.SdMonthly;
          }
        }}>Use Monthly Returns</Radio
      >
      <Radio
        isChecked={selectedMetric === EMetric.SdDaily}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.SdDaily;
          }
        }}>Use Daily Returns</Radio
      >
    </div>
  {/if}

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
    <h2>General Options</h2>
    <Checkbox
      isChecked={showAggregates}
      onChange={isChecked => {
        showAggregates = isChecked;
      }}>Show Aggregate Stats: Min, Average, Median, Max and Standard Deviation</Checkbox
    >
  </div>

  {#each $statsAPI.data as stats}
    <article class="chart-container">
      <Chart
        {showAggregates}
        metric={selectedMetric}
        title={`${stats.period}-Year ${metricTitles[selectedMetric]}`}
        data={stats.list}
      />
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
