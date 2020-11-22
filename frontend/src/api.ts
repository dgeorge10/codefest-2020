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

  getAllUsers(): Promise<any> {
    return instance.get("/api/allUsers");
  }

  /*
  insert(): Promise<any> {
    return instance.get("/api/insertDevices");
  }
  */
}

class DeviceApi {
  addDevice(deviceName: string, username: string): Promise<any> {
    return instance.post("/api/addDevice", {
      deviceName: deviceName,
      username: username,
    });
  }

  deleteDevice(deviceName: string, username: string): Promise<any> {
    return instance.delete("/api/deleteDevice", {
      data: {
        username: username,
        deviceName: deviceName,
      },
    });
  }
}

export const Api = {
  users: new UserApi(),
  devices: new DeviceApi(),
};
