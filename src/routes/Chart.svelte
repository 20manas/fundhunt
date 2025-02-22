<script lang="ts">
  import dayjs from 'dayjs';
  import {
    createChart,
    ColorType,
    type ISeriesApi,
    type Time,
    type MouseEventHandler,
    AreaSeries,
    type IRange,
    type IChartApi,
  } from 'lightweight-charts';
  import * as Ri from 'radashi';

  import {min, max, average, median, stdDev} from '$lib/aggregates';
  import {waitForPaint} from '$lib/events';
  import {percentageFormatter} from '$lib/format';
  import {isNotNull, isNull} from '$lib/type';
  import type {TFund} from '$types/funds';
  import type {TXirrEntry} from '$types/rolling';

  import Legend from './Legend.svelte';

  const colors = [
    '#3cb49b',
    '#e6194B',
    '#ffe119',
    '#4363d8',
    '#f58231',
    '#911eb4',
    '#42d4f4',
    '#f032e6',
    '#bfef45',
    '#fabed4',
    '#469990',
    '#dcbeff',
    '#9A6324',
    '#fffac8',
    '#800000',
    '#aaffc3',
    '#808000',
    '#ffd8b1',
    '#000075',
    '#a9a9a9',
  ];

  interface tProps {
    title: string;
    showAggregates: boolean;
    data: Array<TFund & {data: TXirrEntry[]}>;
  }

  let props: tProps = $props();
  let legendData = $state<Array<{name: string; color: string; value: number | null}>>([]);
  let chartObj: IChartApi | null = null;
  let seriesList: Array<ISeriesApi<'Area'>> = [];
  let timeRange = $state<{from: string; to: string} | null>(null);

  const setChartTimeRange = Ri.debounce({delay: 200}, (range: IRange<Time> | null) => {
    if (isNull(range)) {
      timeRange = null;

      return;
    }

    timeRange = {
      from: range.from.toString(),
      to: range.to.toString(),
    };
  });

  const addChart = (element: HTMLDivElement, data: tProps['data']) => {
    const chart = createChart(element, {
      width: element.clientWidth,
      height: 300,
      autoSize: true,
      layout: {
        background: {type: ColorType.Solid, color: 'transparent'},
        textColor: 'white',
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          color: 'rgb(50, 50, 50)',
        },
        horzLines: {
          color: 'rgb(100, 100, 100)',
        },
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      handleScale: {
        axisDoubleClickReset: true,
      },
      timeScale: {
        minBarSpacing: 0.2,
        barSpacing: 0.4,
      },
      localization: {
        priceFormatter: percentageFormatter,
      },
    });

    chartObj = chart;

    const chartTimeScale = chart.timeScale();

    chartTimeScale.fitContent();
    setChartTimeRange(chartTimeScale.getVisibleRange());

    chartTimeScale.subscribeVisibleTimeRangeChange(setChartTimeRange);

    const handleCrosshairMove: MouseEventHandler<Time> = param => {
      interface tSeriesItem {
        value: number;
        customValues: {
          color: string;
        };
      }

      const map = new Map(
        Array.from(param.seriesData.values() as unknown as tSeriesItem[]).map(item => [item.customValues.color, item]),
      );

      for (const fund of legendData) {
        fund.value = map.get(fund.color)?.value ?? null;
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    const handleResize = () => chart.applyOptions({width: element.clientWidth});

    window.addEventListener('resize', handleResize);

    const addData = (data: tProps['data']) => {
      seriesList.forEach(series => chart.removeSeries(series));
      seriesList = [];

      data.forEach((fund, i) => {
        const color = colors[i];

        const newSeries = chart.addSeries(AreaSeries, {
          // title: series.name,
          lineWidth: 2,
          lineColor: color,
          topColor: 'transparent',
          bottomColor: 'transparent',
          priceLineVisible: false,
          crosshairMarkerRadius: 3,
          crosshairMarkerBorderWidth: 1,
          crosshairMarkerBorderColor: 'white',
          lastValueVisible: false,
          // topColor: color,
          // bottomColor: color + '00',
        });

        newSeries.setData(fund.data.map(item => ({time: item.date, value: item.xirr ?? 0, customValues: {color}})));

        seriesList.push(newSeries);
      });

      legendData = data.map((fund, i) => ({
        name: fund.title,
        color: colors[i],
        value: null,
      }));
    };

    addData(data);

    return {
      update: async (data: tProps['data']) => {
        chart.unsubscribeCrosshairMove(handleCrosshairMove);

        addData(data);

        await waitForPaint();

        chart.subscribeCrosshairMove(handleCrosshairMove);
      },
      destroy: () => {
        window.removeEventListener('resize', handleResize);

        chart.remove();
      },
    };
  };

  $effect(() => {
    if (isNull(chartObj) || isNull(timeRange)) return;

    const timeScale = chartObj.timeScale();
    const chartRange = timeScale.getVisibleRange();

    if (timeRange.from === chartRange?.from && timeRange.to === chartRange.to) return;

    timeScale.setVisibleRange(timeRange);
  });

  const getRawDataForStats = (data: TXirrEntry[], timeRange: {from: string; to: string}) =>
    data
      .filter(item => {
        if (isNull(item.xirr)) return false;

        const date = dayjs(item.date);

        return !date.isBefore(dayjs(timeRange.from)) && !date.isAfter(dayjs(timeRange.to));
      })
      .map(item => item.xirr as number);

  const formatAgg = (agg: number | null) => {
    if (isNull(agg)) return 'N / A';

    return percentageFormatter(agg);
  };
</script>

<h2>{props.title}</h2>
<Legend data={legendData} />
<div use:addChart={props.data}></div>
{#if isNotNull(timeRange)}
  <div class="time-range">
    <input type="date" bind:value={timeRange.from} />
    <input type="date" class="end-date" bind:value={timeRange.to} />
    <button
      class="button"
      onclick={() => {
        chartObj?.timeScale().fitContent();
      }}>Reset</button
    >
  </div>
{/if}
{#if props.showAggregates && isNotNull(timeRange)}
  <div class="container">
    <h3>Aggregate Stats of {props.title} ({timeRange.from} to {timeRange.to})</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Min</th>
          <th>Average</th>
          <th>Median</th>
          <th>Max</th>
          <th>Std Dev</th>
        </tr>
      </thead>
      <tbody>
        {#each props.data as row}
          {@const rawData = getRawDataForStats(row.data, timeRange)}
          <tr>
            <td>{row.title}</td>
            <td>{formatAgg(min(rawData))} </td>
            <td>{formatAgg(average(rawData))} </td>
            <td>{formatAgg(median(rawData))} </td>
            <td>{formatAgg(max(rawData))} </td>
            <td>{formatAgg(stdDev(rawData))} </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .time-range {
    display: flex;
    gap: 10px;
  }

  input[type='date'] {
    border: none;
    padding: 10px;
    background-color: #3cb49baa;
    border-radius: 20px;

    @include mixins.for-mobile {
      padding: 5px;
    }

    &.end-date {
      margin-left: auto;
    }
  }

  h3 {
    text-align: center;
  }

  th {
    text-align: left;
    padding: 10px 0;
  }

  td {
    padding: 10px 0;
  }
</style>
