<script lang="ts">
  import {
    createChart,
    ColorType,
    type ISeriesApi,
    type Time,
    type MouseEventHandler,
    AreaSeries,
  } from 'lightweight-charts';

  import {waitForPaint} from '$lib/events';
  import {percentageFormatter} from '$lib/format';
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
    data: Array<TFund & {data: TXirrEntry[]}>;
  }

  let props: tProps = $props();
  let legendData = $state<Array<{name: string; color: string; value: number | null}>>([]);
  let seriesList: Array<ISeriesApi<'Area'>> = [];

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

    chart.timeScale().fitContent();

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
</script>

<Legend data={legendData} />
<div use:addChart={props.data}></div>
