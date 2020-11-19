export interface Device {
  name: string;
  usage: string[];
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
