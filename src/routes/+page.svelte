<script lang="ts">
  import {SvelteSet} from 'svelte/reactivity';
  import {get, toStore} from 'svelte/store';
  import {queryParam} from 'sveltekit-search-params';

  import Checkbox from '$components/Checkbox.svelte';
  import DropdownSmall from '$components/DropdownSmall.svelte';
  import Loader from '$components/Loader.svelte';
  import Radio from '$components/Radio.svelte';
  import {DEFAULT_RISK_FREE_RETURN} from '$lib/constants';
  import {runOnIdle} from '$lib/events';
  import {formatMetric} from '$lib/format';
  import {isNotNullish, isNull} from '$lib/type';
  import {EFundType, type TFund} from '$types/funds';
  import {EMetric} from '$types/metrics';

  import Chart from './Chart.svelte';
  import FundSelector from './FundSelector.svelte';
  import {getIndexFundList} from './funds.svelte';
  import logo from './logo.webp';
  import {getStats, type TStatsRequestData} from './stats.svelte';

  const PERIODS: number[] = [1, 3, 5, 7, 10] as const;

  const metricTitles: Record<EMetric, string> = {
    [EMetric.Xirr]: 'XIRR of SIP',
    [EMetric.Cagr]: 'CAGR (Compound Annual Growth Rate)',
    [EMetric.SdMonthly]: 'Standard Deviation of Monthly Returns',
    [EMetric.SdDaily]: 'Standard Deviation of Daily Returns',
    [EMetric.DdMonthly]: 'Downside Deviation of Monthly Returns',
    [EMetric.DdDaily]: 'Downside Deviation of Daily Returns',
    [EMetric.Sharpe]: 'Sharpe Ratio',
    [EMetric.Sortino]: 'Sortino Ratio',
    [EMetric.DMC]: 'Down-Market Capture Ratio',
    [EMetric.UMC]: 'Up-Market Capture Ratio',
  };

  const selectedMetricQuery = queryParam<EMetric>('metric', {
    encode: (value: EMetric) => value,
    decode: (str: string | null) => str as EMetric | null,
  });

  const encodePeriod = (periods: number[]) => {
    const str = encodeURIComponent(periods.join(','));

    if (str.length === 0) return;

    return str;
  };

  const decodePeriod = (str: string | null) =>
    isNotNullish(str)
      ? decodeURIComponent(str)
          .split(',')
          .map(num => parseInt(num))
      : null;

  const selectedPeriodsQuery = queryParam(
    'periods',
    {
      encode: encodePeriod,
      decode: decodePeriod,
    },
    {pushHistory: false},
  );

  const fundListAPI = getIndexFundList();

  let selectedMetric = $state<EMetric>(get(selectedMetricQuery) ?? EMetric.Xirr);
  let selectedPeriods = $state<Set<number>>(
    new SvelteSet(get(selectedPeriodsQuery) ?? (isNull(get(selectedMetricQuery)) ? [3, 5] : [])),
  );
  let listAllMetrics = $state([EMetric.Xirr, EMetric.DMC, EMetric.Sharpe].includes(selectedMetric) ? false : true);

  const showAggregatesQuery = queryParam('agg', {
    encode: (show: boolean) => (show ? 'true' : undefined),
    decode: (str: string | null) => str === 'true',
    defaultValue: false,
  });

  const showLifetimeQuery = queryParam('alltime', {
    encode: (show: boolean) => (show ? 'true' : undefined),
    decode: (str: string | null) => str === 'true',
    defaultValue: false,
  });

  const riskFreeReturnQuery = queryParam('rfr', {
    encode: (value: number) => (value !== DEFAULT_RISK_FREE_RETURN ? value.toString() : undefined),
    decode: (str: string | null) => (typeof str === 'string' ? parseFloat(str) : null),
    defaultValue: DEFAULT_RISK_FREE_RETURN,
  });

  const marQuery = queryParam('mar', {
    encode: (value: number) => (value !== DEFAULT_RISK_FREE_RETURN ? value.toString() : undefined),
    decode: (str: string | null) => (typeof str === 'string' ? parseFloat(str) : null),
    defaultValue: DEFAULT_RISK_FREE_RETURN,
  });

  const selectedBenchmarkValueQuery = queryParam(
    'bench',
    {
      encode: (value: string) => value,
      decode: (str: string | null) => str,
      defaultValue: 'NIFTY 500',
    },
    {showDefaults: false},
  );

  let showAggregates = $state(get(showAggregatesQuery));
  let showLifetime = $state(get(showLifetimeQuery));

  let riskFreeReturn = $state(get(riskFreeReturnQuery));
  let riskFreeReturnInput = $state(get(riskFreeReturnQuery).toString());

  let mar = $state(get(marQuery));
  let marInput = $state(get(marQuery).toString());

  let orderedFunds = $state<TFund[]>([]);

  let selectedBenchmark = $derived<TFund | undefined>(
    $fundListAPI.data?.find(item => item.value === $selectedBenchmarkValueQuery) ?? undefined,
  );

  let statsRequestData: TStatsRequestData = $derived({
    periods: (['all-time', ...PERIODS] as const).filter(period =>
      period === 'all-time' ? showLifetime : selectedPeriods.has(period),
    ),
    funds: orderedFunds,
    metricConfig: {
      metric: selectedMetric,
      benchmark: [EMetric.DMC, EMetric.UMC].includes(selectedMetric) ? selectedBenchmark : undefined,
      riskFreeReturn,
      mar,
    },
  });

  let statsRequestDataDeferred = $state<typeof statsRequestData>(statsRequestData);

  $effect(() => {
    const fn = (data: typeof statsRequestData) =>
      runOnIdle(() => {
        statsRequestDataDeferred = data;
      });

    fn(statsRequestData);
  });

  const statsRequestDataStore = toStore(() => statsRequestDataDeferred);
  const statsAPI = getStats(statsRequestDataStore);
  let isStatsAPIInitialized = $state(false);

  let mfTitles = $state<Array<{value: string; title: string}>>([]);

  $effect(() => {
    mfTitles = orderedFunds.filter(fund => fund.type === EFundType.MutualFund);

    $statsAPI.data;
  });

  $effect(() => {
    $selectedMetricQuery = selectedMetric;
  });

  $effect(() => {
    $selectedPeriodsQuery = Array.from(selectedPeriods);
  });

  $effect(() => {
    $showAggregatesQuery = showAggregates;
  });

  $effect(() => {
    $showLifetimeQuery = showLifetime;
  });

  $effect(() => {
    $riskFreeReturnQuery = riskFreeReturn;
  });

  $effect(() => {
    $marQuery = mar;
  });

  $effect(() => {
    if (!$statsAPI.someSuccess || isStatsAPIInitialized || selectedPeriods.size === 0) return;

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
    <h2>
      Metrics
      <div class="listAllMetrics">
        <Checkbox
          isChecked={listAllMetrics}
          onChange={(isChecked: boolean) => {
            listAllMetrics = isChecked;
          }}>Show all metrics</Checkbox
        >
      </div>
    </h2>
    <h3>Return Metrics</h3>
    <div class="periods-list">
      <Radio
        isChecked={selectedMetric === EMetric.Xirr}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.Xirr;
          }
        }}>Rolling XIRR of SIP</Radio
      >
      {#if listAllMetrics}
        <Radio
          isChecked={selectedMetric === EMetric.Cagr}
          onChange={(isChecked: boolean) => {
            if (isChecked) {
              selectedMetric = EMetric.Cagr;
            }
          }}>Rolling CAGR (Compound Annual Growth Rate)</Radio
        >
        <Radio
          isChecked={selectedMetric === EMetric.UMC}
          onChange={(isChecked: boolean) => {
            if (isChecked) {
              selectedMetric = EMetric.UMC;
            }
          }}>Rolling Up-Market Capture</Radio
        >
      {/if}
    </div>
    <h3>Risk Metrics</h3>
    <div class="periods-list">
      <Radio
        isChecked={selectedMetric === EMetric.DMC}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.DMC;
          }
        }}>Rolling Down-Market Capture</Radio
      >
      {#if listAllMetrics}
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
      {/if}
    </div>
    <h3>Risk-Adjusted Return Metrics</h3>
    <div class="periods-list">
      <Radio
        isChecked={selectedMetric === EMetric.Sharpe}
        onChange={(isChecked: boolean) => {
          if (isChecked) {
            selectedMetric = EMetric.Sharpe;
          }
        }}>Rolling Sharpe Ratio</Radio
      >
      {#if listAllMetrics}
        <Radio
          isChecked={selectedMetric === EMetric.Sortino}
          onChange={(isChecked: boolean) => {
            if (isChecked) {
              selectedMetric = EMetric.Sortino;
            }
          }}>Rolling Sortino Ratio</Radio
        >
      {/if}
    </div>
  </div>
  {#if ![EMetric.Xirr, EMetric.Cagr].includes(selectedMetric)}
    <div class="periods">
      <hr />
      <h2>
        Options for {metricTitles[selectedMetric]}
      </h2>
      {#if [EMetric.SdDaily, EMetric.SdMonthly, EMetric.DdDaily, EMetric.DdMonthly].includes(selectedMetric)}
        <Radio
          isChecked={[EMetric.SdMonthly, EMetric.DdMonthly].includes(selectedMetric)}
          onChange={(isChecked: boolean) => {
            if (!isChecked) return;

            if (selectedMetric === EMetric.SdDaily) {
              selectedMetric = EMetric.SdMonthly;
            }
            if (selectedMetric === EMetric.DdDaily) {
              selectedMetric = EMetric.DdMonthly;
            }
          }}>Use Monthly Returns</Radio
        >
        <Radio
          isChecked={[EMetric.SdDaily, EMetric.DdDaily].includes(selectedMetric)}
          onChange={(isChecked: boolean) => {
            if (!isChecked) return;

            if (selectedMetric === EMetric.SdMonthly) {
              selectedMetric = EMetric.DdDaily;
            }
            if (selectedMetric === EMetric.DdMonthly) {
              selectedMetric = EMetric.DdDaily;
            }
          }}>Use Daily Returns</Radio
        >
      {/if}

      {#if [EMetric.DMC, EMetric.UMC].includes(selectedMetric)}
        <h3>Benchmark</h3>

        {#snippet DropdownItem(fund: TFund)}
          {fund.title}
        {/snippet}

        <DropdownSmall
          placeholder="Select Benchmark"
          bind:value={$selectedBenchmarkValueQuery}
          isLoading={$fundListAPI.isLoading}
          row={DropdownItem}
          data={$fundListAPI.data?.map(fund => ({value: fund.value, data: fund, search: fund.title})) ?? []}
        />
      {/if}

      {#if [EMetric.Sharpe, EMetric.Sortino].includes(selectedMetric)}
        <h3>Risk-Free Return</h3>
        <input type="number" min={-5} max={40} step={0.1} bind:value={riskFreeReturnInput} />
      {/if}
      {#if [EMetric.Sortino, EMetric.DdDaily, EMetric.DdMonthly].includes(selectedMetric)}
        <h3>MAR (Minimum Acceptable Return) for Downside Deviation</h3>
        <input type="number" min={-5} max={40} step={0.1} bind:value={marInput} />
      {/if}
      {#if [EMetric.Sharpe, EMetric.Sortino, EMetric.DdDaily, EMetric.DdMonthly].includes(selectedMetric)}
        <button
          class="button"
          onclick={() => {
            const parsedRfr = parseFloat(riskFreeReturnInput);

            if (!isNaN(parsedRfr)) riskFreeReturn = parsedRfr;

            const parsedMar = parseFloat(marInput);

            if (!isNaN(parsedMar)) mar = parsedMar;
          }}>Save</button
        >
      {/if}
    </div>
  {/if}

  <div class="periods">
    <hr />
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
    <hr />
    <h2>General Options</h2>
    <div class="periods-list">
      <Checkbox
        isChecked={showAggregates}
        onChange={isChecked => {
          showAggregates = isChecked;
        }}>Also Show Aggregate Stats: Min, Average, Median, Max and Standard Deviation</Checkbox
      >
      <Checkbox
        isChecked={showLifetime}
        onChange={isChecked => {
          showLifetime = isChecked;
        }}>Also Show Total / All-time Values for Selected Metric</Checkbox
      >
    </div>
    <hr />
  </div>

  {#if showLifetime && $statsAPI.data.findIndex(item => item.period === 'all-time') !== -1}
    <h2>All-time {metricTitles[selectedMetric]}</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date Range</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {#each $statsAPI.data.find(item => item.period === 'all-time')?.list ?? [] as row}
          <tr>
            <td>{row.title}</td>
            <td>{row.startDate} to {row.endDate}</td>
            <td>{isNotNullish(row.data) && formatMetric(selectedMetric)(row.data)} </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#each $statsAPI.data.filter(item => item.period !== 'all-time') as stats}
    <article class="chart-container">
      <Chart
        {showAggregates}
        metric={selectedMetric}
        title={`${stats.period}-Year Rolling ${metricTitles[selectedMetric]}`}
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

  h2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  input {
    border: none;
    padding: 10px;
    border-radius: 10px;
    background-color: rgb(50, 50, 50);
    width: 200px;
  }

  .button {
    width: 100px;
  }

  .listAllMetrics {
    font-size: 16px;
    font-weight: 400;
    display: inline-block;
  }

  hr {
    height: 1px;
    background-color: white;
    border: none;
  }

  table {
    @include mixins.for-desktop {
      min-width: 600px;
    }

    @include mixins.for-mobile {
      width: 100%;
    }
  }

  th,
  td {
    padding: 10px;
    text-align: left;
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
    width: 800px;
    max-width: 100%;
  }

  .periods-list {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    padding: 0 20px;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 800px;
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
