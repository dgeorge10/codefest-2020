/* eslint-disable object-curly-newline */
import React, { useState } from "react";
import { InputLabel, FormControl, Input, Button } from "@material-ui/core";
import { Api } from "../api";

export default function AddDevice() {
  const [deviceName, setDeviceName] = useState<string>("");

  return (
    <div>
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
        onClick={() => {
          Api.users
            .addDevice(deviceName)
            .then(console.log)
            .catch(console.error);
        }}
      >
        Create
      </Button>
    </div>
  );
}
