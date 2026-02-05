import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const options = {
  chart: {
    type: "column"
  },

  title: {
    text: "Stacked Column with Net Total"
  },

  xAxis: {
    categories: ["Jan", "Feb", "Mar"]
  },

  yAxis: {
    title: {
      text: "Value"
    },
    stackLabels: {
      enabled: true,
      formatter: function () {
        const chart = this.axis.chart;
        const xIndex = this.x;

        let total = 0;
        chart.series.forEach(series => {
          if (series.visible) {
            const point = series.data[xIndex];
            if (point) {
              total += point.y;
            }
          }
        });

        return total !== 0 ? total : null;
      },
      style: {
        fontWeight: "bold",
        color: "#000"
      }
    }
  },

  plotOptions: {
    column: {
      stacking: "normal"
    }
  },

  series: [
    {
      name: "Profit",
      data: [5, 3, 4]
    },
    {
      name: "Loss",
      data: [-2, -2, -3]
    }
  ]
};

export default function App() {
  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
