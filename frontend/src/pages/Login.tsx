/* eslint-disable react/require-default-props */
/* eslint-disable indent */
/* eslint-disable object-curly-newline */
import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  makeStyles,
} from "@material-ui/core";
import { Api } from "../api";
import { User } from "../models";

const useStyles = makeStyles((theme) => ({
  loginForm: {
    justifyContent: "center",
    minHeight: "40vh",
  },
  button: {
    width: "100%",
    margin: theme.spacing(0.5),
  },
  loginBackground: {
    justifyContent: "center",
    minHeight: "30vh",
    padding: "50px",
  },
  input: {
    padding: "5px",
  },
}));

interface Props {
  onLogin: (user: User) => any;
}

export default function Login(props: Props) {
  const { onLogin } = props;
  const classes = useStyles();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <Grid container className={classes.loginForm}>
      <Paper
        variant="elevation"
        elevation={2}
        className={classes.loginBackground}
      >
        <Grid item>
          <Typography component="h1" variant="h5" style={{ padding: "5px" }}>
            Sign in
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            type="username"
            placeholder="Username"
            fullWidth
            margin="dense"
            name="username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className={classes.input}
          />
        </Grid>
        <Grid item>
          <TextField
            type="password"
            placeholder="Password"
            fullWidth
            margin="dense"
            name="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={classes.input}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={classes.button}
            onClick={() => {
              Api.users
                .login({
                  username,
                  password,
                })
                .then((userResp: any) => {
                  onLogin({
                    // eslint-disable-next-line no-underscore-dangle
                    _id: userResp.data._id,
                    username: userResp.data.username,
                    password: userResp.data.password,
                    devices: userResp.data.devices,
                  });
                })
                .catch(console.error);
            }}
          >
            Login
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={classes.button}
            onClick={() => {
              Api.users
                .register({ username, password })
                .then((userResp: any) => {
                  onLogin({
                    // eslint-disable-next-line no-underscore-dangle
                    _id: userResp.data._id,
                    username: userResp.data.username,
                    password: userResp.data.password,
                    devices: userResp.data.devices,
                  });
                })
                .catch((e) => console.log(e));
            }}
          >
            Register
          </Button>
          {/*
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={classes.button}
            onClick={() => {
              Api.users
                .insert()
                .then((x) => console.log(x))
                .catch((e) => console.log(e));
            }}
          >
            insert once
          </Button>
          */}
        </Grid>
      </Paper>
    </Grid>
  );
}
