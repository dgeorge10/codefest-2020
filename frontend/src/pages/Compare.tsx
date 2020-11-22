/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from "react";
import { Paper, Grid, makeStyles, Typography } from "@material-ui/core";
import { Bar } from "react-chartjs-2";
import { Api } from "../api";
import { User } from "../models";
import { deviceAverage } from "./AddDevice";
import { getColorPalette } from "./Dashboard";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
  },
}));

interface CompareDataset {
  label: string;
  stack: string;
  data: number[];
  backgroundColor: string;
  hoverBackgroundColor: string;
}

export default function Compare() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const classes = useStyles();

  useEffect(() => {
    Api.users
      .getAllUsers()
      .then((resp) => {
        console.log("fetched all users");
        console.log(resp.data);
        setAllUsers(resp.data);
      })
      .catch(console.error);
  }, []);

  let compareData = {};
  const datasets: CompareDataset[] = [];
  const labels = ["Friend"];

  if (allUsers && allUsers.length) {
    allUsers.forEach((user, i) => {
      let average = 0;
      user.devices.forEach((dev) => {
        const devAverage = deviceAverage(dev);
        average += devAverage;
      });
      datasets.push({
        label: user.username,
        stack: `Stack ${i}`,
        data: [average],
        backgroundColor: getColorPalette(i, allUsers.length),
        hoverBackgroundColor: getColorPalette(i, allUsers.length),
      });
    });
  }
  compareData = {
    labels: labels,
    datasets: datasets,
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: "10px" }}>
          <Typography variant="h4">Compare Water Usage</Typography>
          <Bar
            width={100}
            height={50}
            data={compareData}
            options={{
              maintainAspectRation: true,
              scales: {
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: "Average Gallons per Day",
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
