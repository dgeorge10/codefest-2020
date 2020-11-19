/* eslint-disable no-underscore-dangle */
import React, { useEffect } from "react";
import { Grid } from "@material-ui/core";
import { User } from "../models";
import { Api } from "../api";

interface Props {
  user: User;
}

const tempDevices: string[] = [""];

export default function Dashboard(props: Props) {
  const { user } = props;
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
    <Grid container style={{ height: "600px" }}>
      {user && user._id}
      {devices && devices}
    </Grid>
  );
}
