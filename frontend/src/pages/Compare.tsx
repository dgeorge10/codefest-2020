/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from "react";
import { Paper, Grid, makeStyles, Typography } from "@material-ui/core";
import { Api } from "../api";
import { User } from "../models";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
  },
}));

export default function Compare() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const classes = useStyles();

  useEffect(() => {
    Api.users
      .getAllUsers()
      .then((resp) => {
        console.log("fetched all users");
        setAllUsers(resp.data);
      })
      .catch(console.error);
  }, []);

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: "10px", height: "200px" }}>
          <Typography variant="h4">Compare Water Usage</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
