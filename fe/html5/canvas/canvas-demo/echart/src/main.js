import * as echarts from 'echarts';
import { months, salesData, title } from './data.js';

const chartDom = document.getElementById('chart');
const chart = echarts.init(chartDom);

const option = {
  title: {
    text: title
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  xAxis: {
    data: months
  },
  yAxis: {
    name: '销售额（百万元）'
  },
  series: [
    {
      name: '运动鞋',
      type: 'bar',
      data: salesData,
      itemStyle: {
        color: '#5470c6'
      }
    }
  ]
};

chart.setOption(option);
