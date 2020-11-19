/* eslint-disable no-underscore-dangle */
import React, { useEffect } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { Bar } from "react-chartjs-2";
import { User } from "../models";
import { Api } from "../api";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex", 
    flexDirection: "column", 
    flexWrap: "wrap" 
  }
}));

interface Props {
  user: User;
}

const data = {
  labels: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  datasets: [
    {
      label: "My First dataset",
      backgroundColor: "rgba(255,99,132,0.2)",
      borderColor: "rgba(255,99,132,1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(255,99,132,0.4)",
      hoverBorderColor: "rgba(255,99,132,1)",
      data: [65, 59, 80, 81, 56, 55, 40, 69],
    },
  ],
};

const tempDevices: string[] = [""];

export default function Dashboard(props: Props) {
  const { user } = props;
  const classes = useStyles();
  // const [devices] = user.devices;
  const devices = tempDevices;

  /*
  useEffect(() => {
    if (user) {
      Api.users.getUser(user.username).then(console.log).catch(console.error);
    }
  }, [user]);
  */

  return (
    <Grid container className={classes.container}>
      <Grid item md={12} style={{ }}>
        <Bar
          data={data}
          width={100}
          height={300}
          options={{
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: "Volume",
                  },
                },
              ],
            },
          }}
        />
      </Grid>
      <Grid item md={12}>
        <Bar
          data={data}
          width={100}
          height={300}
          options={{
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  scaleLabel: {
                    display: true,
                    labelString: "Volume",
                  },
                },
              ],
            },
          }}
        />
      </Grid>
    </Grid>
  );
}
