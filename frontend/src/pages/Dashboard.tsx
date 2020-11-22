/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from "react";
import { Grid, makeStyles, Typography, Paper } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { Bar } from "react-chartjs-2";
import { User, GroupedUsage } from "../models";
import deviceUsageToRange, { addDays } from "../utils/convert";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
  },
  chartGrid: {
    padding: theme.spacing(2),
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

function getColorPalette(i: number, max: number): string {
  return `hsl( ${(i / max) * 360} ,100%,50%)`;
}

export default function Dashboard(props: Props) {
  const { user } = props;
  const [chartData, setChartData] = useState<GroupedUsage[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    addDays(new Date(), -6)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const classes = useStyles();

  let data = {};
  const datasets: ChartDataset[] = [];
  const labels: string[] = [];

  useEffect(() => {
    if (user && startDate && endDate) {
      setChartData(deviceUsageToRange(user.devices, startDate, endDate));
    }
  }, [user, startDate, endDate]);

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
    data = {
      labels: labels,
      datasets: datasets,
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
      <Paper elevation={3}>
        <Grid item md={12} className={classes.chartGrid}>
          <Typography variant="h4">Weekly Usage</Typography>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              className={classes.datePicker}
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
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
              id="date-picker-inline"
              label="End date"
              value={endDate}
              onChange={handleEndDateChange}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>
          <Bar
            data={data}
            width={100}
            height={300}
            options={{
              maintainAspectRatio: false,
              scales: {
                yAxes: [
                  {
                    stacked: true,
                    scaleLabel: {
                      display: true,
                      labelString: "Volume",
                    },
                  },
                ],
                xAxes: [
                  {
                    stacked: true,
                  },
                ],
              },
            }}
          />
        </Grid>
      </Paper>
      <Paper elevation={3}>
        <Grid item md={12} className={classes.chartGrid}>
          <Typography>Current Usage</Typography>
        </Grid>
      </Paper>
    </Grid>
  );
}
