export interface DeviceUsage {
  date: string;
  amount: number;
}

export interface Device {
  name: string;
  usage: DeviceUsage[];
}

export interface User {
  _id: string;
  username: string;
  password?: string;
  devices: Device[];
}

export interface UserSimple {
  username: string;
  password: string;
}
