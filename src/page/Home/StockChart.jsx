import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts';
import { Button } from "@/components/ui/button"
import { getCoinMarketChart } from '@/lib/api';

const timeSeries = [
  {
    label: "1 Day",
    value: 1,
  },
  {
    label: "1 Week",
    value: 7,
  },
  {
    label: "1 Month",
    value: 30,
  },
];

const StockChart = ({ coinId = "bitcoin" }) => {
  const [activeLabel, setActiveLabel] = useState("1 Day")
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentCoinId, setCurrentCoinId] = useState(coinId)

  // 监听用户选择的币种变化
  useEffect(() => {
    const handleCoinSelected = (event) => {
      if (event.detail && event.detail.coin) {
        setCurrentCoinId(event.detail.coin.id)
      }
    }
    
    window.addEventListener('coinSelected', handleCoinSelected)
    
    return () => {
      window.removeEventListener('coinSelected', handleCoinSelected)
    }
  }, [])

  // 当coinId属性变化时更新currentCoinId
  useEffect(() => {
    setCurrentCoinId(coinId)
  }, [coinId])

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      try {
        // 根据用户选择的时间段获取对应天数的数据
        const days = timeSeries.find(item => item.label === activeLabel)?.value || 1
        const data = await getCoinMarketChart(currentCoinId, 'usd', days)
        
        if (data && data.prices && data.prices.length > 0) {
          setChartData([{
            data: data.prices
          }])
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
        // 如果获取数据出错，尝试回退到比特币数据
        if (currentCoinId !== 'bitcoin') {
          console.log('Falling back to bitcoin chart data')
          try {
            const days = timeSeries.find(item => item.label === activeLabel)?.value || 1
            const fallbackData = await getCoinMarketChart('bitcoin', 'usd', days)
            if (fallbackData && fallbackData.prices && fallbackData.prices.length > 0) {
              setChartData([{
                data: fallbackData.prices
              }])
            }
          } catch (fallbackError) {
            console.error('Error fetching fallback chart data:', fallbackError)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [currentCoinId, activeLabel])

  const options = {
    chart: {
      id: "area-datetime",
      type: "area",
      height: "450",
      zoom: {
        autoScaleYaxis: true
      },
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      type: "datetime",
      tickAmount: 6,
      labels: {
        style: {
          colors: '#78909c'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return val.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        },
        style: {
          colors: '#78909c'
        }
      }
    },
    colors: ["#758AA2"],
    markers: {
      colors: ["#fff"],
      strokeColor: "#fff",
      size: 0,
      strokeWidth: 1,
      style: "hollow"
    },
    tooltip: {
      theme: "dark",
      x: {
        format: 'dd MMM HH:mm'
      },
      y: {
        formatter: function(val) {
          return val.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#47535E",
      strokeDashArray: 4,
      show: true,
    },
  };

  const handleActiveLabel = (value) => {
    setActiveLabel(value);
  }

  return (
    <div>
      <div className='space-x-3 mb-4'>
        {timeSeries.map((item) => (
          <Button 
            variant={activeLabel === item.label ? "" : "outline"}
            onClick={() => handleActiveLabel(item.label)} 
            key={item.label}
            className="rounded-md"
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div id="chart-timelines">
        {loading ? (
          <div className="flex justify-center items-center h-[450px]">
            <p>Loading chart data...</p>
          </div>
        ) : (
          <ReactApexChart
            options={options}
            series={chartData}
            type="area"
            height={450}
          />
        )}
      </div>
    </div>
  );
};

export default StockChart