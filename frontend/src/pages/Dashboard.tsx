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
import { User, GroupedUsage, LiveDatapoint, LiveDeviceUsage } from "../models";
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
  setUser: (user: User) => void;
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

function getColorPalette(i: number, max: number): string {
  return `hsl( ${(i / max) * 360} ,100%,50%)`;
}

function generateLiveLabels(liveDatasets: LiveChartDataset[]) {
  const labels: Date[] = [];
  liveDatasets[0].data.forEach((point) => {
    labels.push(point.x);
  });
  return labels;
}

export default function Dashboard(props: Props) {
  const { user, setUser } = props;
  const [chartData, setChartData] = useState<GroupedUsage[]>([]);
  const [liveData, setLiveData] = useState<LiveDeviceUsage[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    addDays(new Date(), -6)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState(Date.now());
  const classes = useStyles();

  useEffect(() => {
    if (user._id !== "0") {
      const interval = setInterval(async () => {
        await Api.users
          .getUser(user.username)
          .then((response) => {
            console.log("refeteched user data");
            setUser(response.data);
            setTime(Date.now());
          })
          .catch(console.error);
        return () => clearInterval(interval);
      }, 1000 * 60);
    }
  }, []);

  useEffect(() => {
    if (user && startDate && endDate && user.devices) {
      const currentDate: Date = new Date();
      // currentDate.setDate(currentDate.getDate() - 1);
      setChartData(deviceUsageToRange(user.devices, startDate, endDate));
      setLiveData(deviceUsageToMinutes(user.devices, currentDate));
    }
  }, [user, startDate, endDate]);

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
      labels.push(dayLabels[date.getDay()]);
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
    </Grid>
  );
}
