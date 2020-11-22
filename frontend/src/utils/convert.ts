import {
  Device,
  GroupedUsage,
  DeviceUsage,
  LiveDeviceUsage
} from "../models";

export default function deviceUsageToRange(
  devices: Device[],
  startDate: Date,
  endDate: Date
) {
  if (startDate > endDate) {
    console.log("ERROR: Start date after end Date");
    return [];
  }

  const dailyUsage: GroupedUsage[] = [];
  devices.forEach((device) => {
    dailyUsage.push({
      name: device.name,
      usage: [],
    });
    let d: Date = addDays(startDate, 0);
    /* Generate the list of days */
    while (d <= endDate) {
      const newUsage: DeviceUsage = {
        date: d,
        amount: 0,
      };
      dailyUsage[dailyUsage.length - 1].usage.push(newUsage);
      d = addDays(d, 1);
    }
  });

  devices.forEach((device, i) => {
    device.usage.forEach((use) => {
      dailyUsage[i].usage.forEach((indexedDay) => {
        if (datesMatch(indexedDay.date, new Date(use.date))) {
          indexedDay.amount += use.amount;
        }
      });
    });
  });
  return dailyUsage;
}

function datesMatch(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function datesMatchToMin(date1: Date, date2: Date): boolean {
  return (
    date1.getMinutes() === date2.getMinutes() &&
    date1.getHours() === date2.getHours() &&
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function deviceUsageToMinutes(
  devices: Device[],
  day: Date,
) {
  const liveUsage: LiveDeviceUsage[] = [];
  devices.forEach((device) => {
    liveUsage.push({
      name: device.name,
      resolution: "1 min",
      data: [
        {
          x: 0,
          y: 0,
        },
      ],
    });
  });

  devices.forEach((device, i) => {
    let lastDate: Date;
    device.usage.forEach((use) => {
      if (datesMatch(day, new Date(use.date))) {
        if (lastDate === undefined) {
          lastDate = new Date(use.date);
        }
        if (!datesMatchToMin(lastDate, new Date(use.date))) {
          liveUsage[i].data.push({
            x: new Date(use.date).getMinutes(),
            y: liveUsage[i].data[liveUsage[i].data.length - 1].y,
          });
          const liveDatapoint = liveUsage[i].data[liveUsage[i].data.length - 1];
          liveDatapoint.y += use.amount;
        }
      }
    });
  });

  /* Add a point for the currentTime */
  const currentTime = new Date();
  if (datesMatch(currentTime, day)) {
    devices.forEach((device, i) => {
      liveUsage[i].data.push({
        x: currentTime.getMinutes(),
        y: liveUsage[i].data[liveUsage[i].data.length - 1].y,
      });
    });
  }

  return liveUsage;
}
