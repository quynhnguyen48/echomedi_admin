import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import dayjs from "dayjs";

import Page from "components/Page";
import Icon from "components/Icon";
import Select from "components/Select";
import { abbreviateNumber, formatPrice } from "utils/number";
import GraphTooltip from "./Components/GraphTooltip";
import CalendarGrowth from "./Components/CalendarGrowth";
import { MONTHS } from "constants/Dates";
import { getYearlyRevenue } from "services/api/transactions";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TOTAL_DATA = [
  {
    key: "totalRevenue",
    title: "Tổng doanh thu",
    icon: "coin",
  },
  {
    key: "totalIncome",
    title: "Tổng thu nhập",
    icon: "coin",
  },
  {
    key: "totalCustomers",
    title: "Lượng khách hàng",
    icon: "user",
  },
];

const GrowthReport = () => {
  const chartRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [monthSelected, setMonthSelected] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [data, setData] = useState([]);
  const [showChart, setShowChart] = useState(true);
  const [yearSelected, setYearSelected] = useState(dayjs().year());

  const YEARS_SELECTION = useMemo(() => {
    const currentYear = dayjs().year();
    const years = [];
    for (let index = 2022; index <= currentYear; index++) {
      years.push({ value: index, label: index });
    }
    return years;
  }, []);

  const customTooltip = useCallback(
    (context) => {
      if (context.tooltip.opacity === 0) {
        // hide tooltip visibility
        setTooltipVisible(false);
        return;
      }

      const chart = chartRef.current;
      const canvas = chart.canvas;
      if (canvas) {
        // enable tooltip visibility
        setTooltipVisible(true);

        // set position of tooltip
        const left = context.tooltip.x;
        const top = context.tooltip.y - 110;

        // handle tooltip multiple rerender
        if (tooltipPos?.top !== top) {
          setTooltipPos({ top, left });
          const monthIndex = context.tooltip.dataPoints[0].dataIndex;
          const yearIndex = context.tooltip.dataPoints[0].datasetIndex;
          setMonthSelected({
            month: `${data[monthIndex].month}, ${data[monthIndex].years[yearIndex].year}`,
            ...data[monthIndex].years[yearIndex],
          });
        }
      }
    },
    [data, tooltipPos?.top]
  );

  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: "nearest",
          external: customTooltip,
        },
        subtitle: {
          display: false,
        },
        decimation: {
          enabled: false,
        },
        filler: {},
      },
    };
  }, [customTooltip]);

  const renderChart = useCallback(async (year = dayjs().year()) => {
    try {
      const labels = MONTHS.map((item) => item.toUpperCase());
      const currentYearRes = await getYearlyRevenue({ year });
      const lastYearRes = await getYearlyRevenue({ year: year - 1 });
      const last2YearRes = await getYearlyRevenue({ year: year - 2 });
      const data = MONTHS.map((month, index) => {
        const monthString = index + 1 >= 1 && index + 1 <= 9 ? `0${index + 1}` : `${index}`;

        return {
          month,
          years: [
            {
              year: year - 2,
              totalRevenue: last2YearRes?.data?.[monthString]?.totalRevenue || 0,
              totalIncome: last2YearRes?.data?.[monthString]?.totalIncome || 0,
              totalCustomers: last2YearRes?.data?.[monthString]?.totalCustomers
                ? parseInt(last2YearRes?.data?.[monthString]?.totalCustomers)
                : 0,
            },
            {
              year: year - 1,
              totalRevenue: lastYearRes?.data?.[monthString]?.totalRevenue || 0,
              totalIncome: lastYearRes?.data?.[monthString]?.totalIncome || 0,
              totalCustomers: lastYearRes?.data?.[monthString]?.totalCustomers
                ? parseInt(lastYearRes?.data?.[monthString]?.totalCustomers)
                : 0,
            },
            {
              year,
              totalRevenue: currentYearRes?.data?.[monthString]?.totalRevenue || 0,
              totalIncome: currentYearRes?.data?.[monthString]?.totalIncome || 0,
              totalCustomers: currentYearRes?.data?.[monthString]?.totalCustomers
                ? parseInt(currentYearRes?.data?.[monthString]?.totalCustomers)
                : 0,
            },
          ],
        };
      });
      setData(data);
      setChartData({
        labels,
        datasets: [
          {
            data: data.map((item) => item.years[0].totalRevenue),
            backgroundColor: "rgb(42, 120, 113, 70%)",
          },
          {
            data: data.map((item) => item.years[1].totalRevenue),
            backgroundColor: "rgb(42, 120, 113, 80%)",
          },
          {
            data: data.map((item) => item.years[2].totalRevenue),
            backgroundColor: "rgb(42, 120, 113, 100%)",
          },
        ],
      });
    } catch (error) {}
  }, []);

  const getTotalData = (key) => {
    let total = 0;
    data.forEach((item) => {
      total += item.years.find((year) => year.year === yearSelected)?.[key] || 0;
    });
    return total;
  };

  useEffect(() => {
    // current month
    renderChart();
  }, [renderChart]);

  return (
    <Page title="Báo cáo tăng trưởng" parentUrl="/reports">
      <div className="mb-8">
        <div className="w-[340px]">
          <Select
            isSecondary
            isSearchable={false}
            onChange={(e) => {
              setYearSelected(e.value);
              renderChart(e.value);
            }}
            value={YEARS_SELECTION.find((year) => year.value === yearSelected)}
            options={YEARS_SELECTION}
          />
        </div>
        <div className="grid grid-cols-4 gap-x-6 mt-8">
          {TOTAL_DATA.map((item, index) => {
            const valueColor = index === 0 ? "text-red" : index === 1 ? "text-pink" : "";
            return (
              <div key={index} className="rounded-xl shadow-sm p-6 flex items-center space-x-4">
                <div className="w-17 h-17 flex items-center justify-center rounded-full bg-primary/10">
                  <Icon name={item.icon} className="fill-primary w-8 h-8" />
                </div>
                <div>
                  <p className="whitespace-nowrap">{item.title}</p>
                  <h2 className={`text-36 font-bold ${valueColor}`}>
                    {index === 2
                      ? getTotalData(item.key)
                      : abbreviateNumber(getTotalData(item.key) || 0)}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative p-6 shadow-sm rounded-lg">
        {chartData && showChart ? (
          <div className="relative">
            <Bar type="" ref={chartRef} options={options} data={chartData} />
          </div>
        ) : (
          <CalendarGrowth
            calendarData={data}
            onShowTooltip={(pos, monthData) => {
              setTooltipVisible(true);
              setTooltipPos(pos);
              setMonthSelected(monthData);
            }}
          />
        )}
        {tooltipPos && (
          <GraphTooltip position={tooltipPos} visibility={tooltipVisible} isChart={showChart}>
            <>
              <>
                <h5 className="text-14 text-primary font-bold mb-4">{monthSelected?.month}</h5>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <p>Total Revenue</p>
                    <p>
                      <b className="text-red">{formatPrice(monthSelected?.totalRevenue)}</b>đ
                    </p>
                  </li>
                  <li className="flex items-center justify-between">
                    <p>Total Income</p>
                    <p>
                      <b className="text-pink">{formatPrice(monthSelected?.totalIncome)}</b>đ
                    </p>
                  </li>
                  <li className="flex items-center justify-between">
                    <p>Total Customers</p>
                    <b>{monthSelected?.totalCustomers}</b>
                  </li>
                </ul>
              </>
            </>
          </GraphTooltip>
        )}
        <button onClick={() => setShowChart(!showChart)} className="absolute top-2 right-2">
          <Icon name={showChart ? "grid" : "chart-square"} className="fill-primary w-7 h-7" />
        </button>
      </div>
    </Page>
  );
};

export default GrowthReport;
