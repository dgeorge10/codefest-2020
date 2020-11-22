/* eslint-disable object-curly-newline */
import React, { useState } from "react";
import {
  InputLabel,
  FormControl,
  Input,
  Button,
  makeStyles,
  Grid,
  Typography,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Api } from "../api";
import { User, Device } from "../models";

const useStyles = makeStyles((theme) => ({
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  gridItem: {
    padding: theme.spacing(2),
  },
}));

interface Props {
  user: User;
  setUser: (user: User) => void;
}

function deviceAverage(row: Device): number {
  if (row.usage.length === 0) {
    return 0;
  }
  const days =
    (new Date(row.usage[row.usage.length - 1].date).getTime() -
      new Date(row.usage[0].date).getTime()) /
    (1000 * 3600 * 24);
  let total = 0;
  row.usage.forEach((use) => {
    total += use.amount;
  });
  return total / Math.floor(1 + days);
}

export default function AddDevice(props: Props) {
  const { user, setUser } = props;
  const { username, devices } = user;
  const classes = useStyles();
  const [deviceName, setDeviceName] = useState<string>("");

  return (
    <Grid container className={classes.grid}>
      <Grid item md={6} className={classes.gridItem}>
        <Typography variant="h4">Current Devices</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device Name</TableCell>
                <TableCell>Average Usage (Gallons/Day)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{`${deviceAverage(row).toFixed(3)}`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item md={4} className={classes.gridItem}>
        <Typography variant="h4">Add a device</Typography>
        <FormControl>
          <InputLabel>Device Name</InputLabel>
          <Input
            value={deviceName}
            onChange={(e) => {
              setDeviceName(e.target.value);
            }}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            Api.users
              .addDevice(deviceName, username)
              .then((resp) => {
                setDeviceName("");
                setUser(resp.data);
              })
              .catch(console.error);
          }}
        >
          Create
        </Button>
      </Grid>
    </Grid>
  );
}
