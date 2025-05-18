import React,{useState} from 'react'
import ReactApexChart from 'react-apexcharts';
import { Button } from "@/components/ui/button"

const timeSeries = [
  {
    keyword: "DIGITAL_CURRENCY_DAILY",
    key: "Time Series (Daily)",
    label: "1 Day",
    value: 1,
  },
  {
    keyword: "DIGITAL_CURRENCY_WEEKLY",
    key: "Weekly Time Series",
    label: "1 Week",
    value: 7,
  },
  {
    keyword: "DIGITAL_CURRENCY_MONTHLY",
    key: "Monthly Time Series",
    label: "1 Month",
    value: 30,
  },
];


const StockChart = () => {

  const [activeLabel,setActiveLabel]=useState("1 day")

  const searies=[
    {
      data:[[1742040295566,84077.984480905],[1742043902074,84133.58364594172],[1742047492340,84397.93103623143],[1742050993955,84141.80648875001],[1742055091681,84282.5733553542],[1742058240332,84351.03100749975],[1742062165080,84450.69621702406],[1742065790983,84173.30840256019],[1742069097504,84295.2224544024],[1742072538200,84369.37930960456],[1742076299786,84374.89491697127],[1742080179407,84358.9159883021],[1742083726119,84354.47191448158],[1742087084371,84244.23238441288],[1742090526515,83899.48633774147],[1742094126534,83955.58636192667],[1742097892346,84323.27268421142],[1742101495469,84418.91164824746],[1742105094666,84356.03663149933]],

    },
  ];
  const options={
    chart:{
      id:"area-datetime",
      type:"area",
      height:"450",
      zoom:{
        autoScaleYaxis:true
      }
    },
    dataLabels:{
      enabled:false
    },
    xaxis:{
      type:"datetime",
      tickAmount:6
    },
    colors:["#758AA2"],
    markers:{
      colors:["#fff"],
      strokeColor:"#fff",
      size:0,
      strokeWidth:1,
      style:"hollow"
    },
    tooltip:{
      theme:"dark"
    },
    fill:{
      type:"gradient",
      gradient:{
        shadeIntensity:1,
        opacityFrom:0.6,
        opacityTo:0.9,
        stops:[0,100],
      },
    },
    grid:{
      borderColor:"#47535E",
      strokeDashArray:4,
      show:true,
    },
  };



  const handleActiveLabel=(value)=>{
    setActiveLabel(value);
  }

  return (
  <div>
      <div className='space-x-3'>
      {timeSeries.map((item) => (
    <Button 
    variant ={activeLabel==item.label?"":"outline"}
    onClick={()=>handleActiveLabel(item.label)} 
    key={item.label}>
      {item.label}
    </Button>
  ))}
       </div>
    <div id="chart-timelines">
      <ReactApexChart
        options={options}
        series={searies}
        type="area"
        height={450}
        />
    </div>
  </div>
  );
};

export default StockChart