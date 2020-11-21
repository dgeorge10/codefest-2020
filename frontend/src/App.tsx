/* eslint-disable object-curly-newline */
import React, { useState } from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import PeopleIcon from "@material-ui/icons/People";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import {
  ListItem,
  ListItemIcon,
  MenuList,
  createStyles,
  useTheme,
} from "@material-ui/core";
import { useHistory, Route, Switch, Link, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import AddDevice from "./pages/AddDevice";
import { User } from "./models";

const useStyles = makeStyles((theme) => {
  const drawerWidth = theme.spacing(6);
  return createStyles({
    root: {
      display: "flex",
    },
    toolbar: {
      display: "flex",
      flexFlow: "row nowrap",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: 12,
    },
    spaces: theme.mixins.toolbar,
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    title: {
      flexGrow: 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerPaperClose: {
      overflowX: "hidden",
      width: theme.spacing(7),
    },
    content: {
      width: "100%",
      marginTop: drawerWidth,
      padding: theme.spacing(2),
    },
    container: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "auto",
      flexDirection: "column",
    },
    fixedHeight: {
      height: 240,
    },
    link: {
      textDecoration: "none",
      color: "inherit",
    },
  });
});

const defaultUser: User = {
  _id: "0",
  devices: [],
  password: "",
  username: "defualt",
};

export default function App() {
  const theme = useTheme();
  const classes = useStyles({});
  const [user, setUser] = useState<User>(defaultUser);
  const history = useHistory();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Codefest 2020
          </Typography>
          <IconButton edge="end" color="inherit">
            <Link to="/login" className={classes.link}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography
                  component="h1"
                  variant="h6"
                  color="inherit"
                  noWrap
                  className={classes.title}
                  style={{ padding: "5px" }}
                >
                  {!_.isEqual(defaultUser, user)
                    ? `Welcome, ${user.username}`
                    : "Log in"}
                </Typography>
                <PersonIcon />
              </div>
            </Link>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        anchor="left"
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaperClose,
        }}
      >
        <div className={classes.spaces} />
        <MenuList>
          <div>
            <Divider />
            <NavLink to="/dashboard" className={classes.link}>
              <ListItem button>
                <ListItemIcon style={{ minWidth: 0 }}>
                  <DashboardIcon />
                </ListItemIcon>
              </ListItem>
            </NavLink>
            <Divider />
            <NavLink
              to="/compare"
              className={classes.link}
              activeClassName="activeNavLink"
            >
              <ListItem button>
                <ListItemIcon style={{ minWidth: 0 }}>
                  <PeopleIcon />
                </ListItemIcon>
              </ListItem>
            </NavLink>
            <Divider />
            <NavLink
              to="/addDevice"
              className={classes.link}
              activeClassName="activeNavLink"
            >
              <ListItem button>
                <ListItemIcon style={{ minWidth: 0 }}>
                  <AddIcon />
                </ListItemIcon>
              </ListItem>
            </NavLink>
            <Divider />
          </div>
        </MenuList>
      </Drawer>

      <main className={classes.content}>
        <Container maxWidth="lg" className={classes.container}>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/dashboard" render={() => <Dashboard user={user} />} />
            <Route path="/compare" component={Compare} />
            <Route
              path="/addDevice"
              render={() => <AddDevice username={user.username} />}
            />
            <Route
              path="/login"
              render={() => (
                <Login
                  onLogin={(newUser) => {
                    setUser(newUser);
                    history.push("/dashboard");
                  }}
                />
              )}
            />
          </Switch>
        </Container>
      </main>
    </div>
  );
}
