/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import axios, { AxiosInstance } from "axios";
import { UserSimple } from "./models";

const instance: AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

class UserApi {
  login(user: UserSimple): Promise<any> {
    return instance.post("/api/login", user);
  }

  register(user: UserSimple): Promise<any> {
    return instance.post("/api/register", user);
  }

  getUser(username: string): Promise<any> {
    return instance.post("/api/_get_user", { username: username });
  }

  addDevice(deviceName: string, username: string): Promise<any> {
    return instance.post("/api/addDevice", {
      deviceName: deviceName,
      username: username,
    });
  }

  /*
  insert(): Promise<any> {
    return instance.get("/api/insertDevices");
  }
  */
}

export const Api = {
  users: new UserApi(),
};
