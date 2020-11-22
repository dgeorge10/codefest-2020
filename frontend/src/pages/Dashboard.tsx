/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from "react";
import { Grid, makeStyles, Typography, Paper } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { Bar, Line } from "react-chartjs-2";
import {
  User,
  GroupedUsage,
  LiveDatapoint,
  LiveDeviceUsage,
  Device,
} from "../models";
import deviceUsageToRange, {
  addDays,
  deviceUsageToMinutes,
} from "../utils/convert";
import { Api } from "../api";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  chartGrid: {
    padding: theme.spacing(2),
    display: "block",
  },
  datePicker: {
    paddingRight: theme.spacing(5),
  },
}));

interface ChartDataset {
  label: string;
  borderWidth: number;
  data: number[];
  backgroundColor: string;
  hoverBackgroundColor: string;
}

interface LiveChartDataset {
  type: string;
  label: string;
  data: LiveDatapoint[];
  backgroundColor: string;
  hoverBackgroundColor: string;
  borderColor: string;
  fill: boolean;
  showLine: boolean;
  spanGaps: boolean;
  pointRadius: number;
  cubicInterpolationMode: string;
}

interface Props {
  user: User;
}

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getColorPalette(i: number, max: number): string {
  return `hsl( ${((360 * ((max + 1) * i)) / max) % 360} ,100%,50%)`;
}

function generateLiveLabels(liveDatasets: LiveChartDataset[]) {
  const labels: Date[] = [];
  liveDatasets[0].data.forEach((point) => {
    labels.push(point.x);
  });
  return labels;
}

export default function Dashboard(props: Props) {
  const { user } = props;
  const [chartData, setChartData] = useState<GroupedUsage[]>([]);
  const [liveData, setLiveData] = useState<LiveDeviceUsage[]>([]);
  const [currentDevices, setCurrentDevices] = useState<Device[]>(
    user && user.devices
  );
  const [startDate, setStartDate] = useState<Date | null>(
    addDays(new Date(), -6)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState(Date.now());
  const classes = useStyles();

  useEffect(() => {
    if (currentDevices && currentDevices.length > 0) {
      const interval = setInterval(async () => {
        await Api.users
          .getUser(user.username)
          .then((response) => {
            console.log("refeteched user data");
            setCurrentDevices(response.data);
            setTime(Date.now());
          })
          .catch(console.error);
        return () => clearInterval(interval);
      }, 1000 * 60);
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate && currentDevices) {
      const currentDate: Date = new Date();
      // currentDate.setDate(currentDate.getDate() - 1);
      setChartData(deviceUsageToRange(currentDevices, startDate, endDate));
      setLiveData(deviceUsageToMinutes(currentDevices, currentDate));
    }
  }, [currentDevices, startDate, endDate]);

  const temperatures = [
    { temp: 54, weather: "Sunny" },
    { temp: 60, weather: "Sunny" },
    { temp: 60, weather: "Sunny" },
    { temp: 59, weather: "Partly Cloudy" },
    { temp: 60, weather: "Partly Cloudy" },
    { temp: 54, weather: "Partly Cloudy" },
    { temp: 40, weather: "Cloudy" },
    { temp: 26, weather: "Cloudy" },
    { temp: 29, weather: "Partly Cloudy" },
    { temp: 28, weather: "Partly Cloudy" },
    { temp: 27, weather: "Partly Cloudy" },
    { temp: 30, weather: "Partly Cloudy" },
    { temp: 30, weather: "Cloudy" },
    { temp: 31, weather: "Partly Cloudy" },
    { temp: 39, weather: "Partly Cloudy" },
    { temp: 41, weather: "Partly Cloudy" },
    { temp: 51, weather: "Partly Cloudy" },
    { temp: 42, weather: "Partly Cloudy" },
    { temp: 33, weather: "Partly Cloudy" },
    { temp: 34, weather: "Sunny" },
    { temp: 33, weather: "Sunny" },
    { temp: 28, weather: "Partly Cloudy" },
    { temp: 23, weather: "Cloudy" },
    { temp: 27, weather: "Partly Cloudy" },
    { temp: 23, weather: "Cloudy" },
    { temp: 23, weather: "Cloudy" },
    { temp: 28, weather: "Partly Cloudy" },
    { temp: 29, weather: "Partly Cloudy" },
    { temp: 29, weather: "Partly Cloudy" },
    { temp: 28, weather: "Partly Cloudy" },
  ];

  let weeklyData = {};
  const datasets: ChartDataset[] = [];
  const labels: string[] = [];
  if (chartData.length > 0) {
    chartData.forEach((device, i) => {
      datasets.push({
        label: device.name,
        borderWidth: 1,
        data: [],
        backgroundColor: getColorPalette(i, chartData.length),
        hoverBackgroundColor: getColorPalette(i, chartData.length),
      });
      device.usage.forEach((use) => {
        datasets[datasets.length - 1].data.push(use.amount);
      });
    });
    chartData[0].usage.forEach((day) => {
      const date = new Date(day.date);
      labels.push(
        `${dayLabels[date.getDay()]} ${temperatures[date.getDate()].temp}°F ${
          temperatures[date.getDate()].weather
        }`
      );
    });
    weeklyData = {
      labels: labels,
      datasets: datasets,
    };
  }

  let liveLineData = {};
  const liveDatasets: LiveChartDataset[] = [];
  if (liveData.length) {
    liveData.forEach((device, i) => {
      liveDatasets.push({
        type: "line",
        label: device.name,
        data: device.data,
        backgroundColor: getColorPalette(i, chartData.length),
        hoverBackgroundColor: getColorPalette(i, chartData.length),
        borderColor: getColorPalette(i, chartData.length),
        fill: false,
        showLine: true,
        spanGaps: true,
        pointRadius: 2,
        cubicInterpolationMode: "monotone",
      });
    });
    liveLineData = {
      labels: generateLiveLabels(liveDatasets),
      datasets: liveDatasets,
    };
  }

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  return (
    <Grid container className={classes.container}>
      <Typography variant="h3">Dashboard</Typography>
      <Grid item xs={12} className={classes.chartGrid}>
        <Paper elevation={3} style={{ padding: "10px" }}>
          <Typography variant="h4">Current Usage</Typography>
          <Line
            data={liveLineData}
            options={{
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      suggestedMin: 0,
                    },
                  },
                ],
                xAxes: [
                  {
                    scaleLabel: {
                      display: true,
                    },
                    type: "time",
                    time: {
                      unit: "minute",
                      stepSize: 15,
                    },
                  },
                ],
              },
              legend: {
                display: true,
                position: "right",
              },
            }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} className={classes.chartGrid}>
        <Paper elevation={3} style={{ padding: "10px", flexShrink: 0 }}>
          <Typography variant="h4">Weekly Usage</Typography>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              className={classes.datePicker}
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="startdate-picker"
              label="Start date"
              value={startDate}
              onChange={handleStartDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="enddate-picker"
              label="End date"
              value={endDate}
              onChange={handleEndDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>
          <Bar
            data={weeklyData}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: true,
              scales: {
                yAxes: [
                  {
                    stacked: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Gallons",
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Week Day",
                    },
                  },
                ],
              },
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}
