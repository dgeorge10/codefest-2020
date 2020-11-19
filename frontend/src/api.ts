/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import axios, { AxiosInstance } from "axios";
import { UserSimple } from "./models";

const instance: AxiosInstance = axios.create({
  baseURL: "http://prieur.ml:2020",
  headers: {
    "Content-Type": "application/json",
  },
});

class UserApi {
  login(user: UserSimple): Promise<any> {
    return instance.post("/login", user);
  }

  register(user: UserSimple): Promise<any> {
    return instance.post("/register", user);
  }

  getUser(username: string): Promise<any> {
    return instance.post("/_get_user", { username: username });
  }
}

export const Api = {
  users: new UserApi(),
};
