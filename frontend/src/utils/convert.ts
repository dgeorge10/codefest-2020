/* eslint-disable object-curly-newline */
import { Device, GroupedUsage, DeviceUsage, LiveDeviceUsage } from "../models";

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

export function datesMatch(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function dateToMin(date: Date): number {
  return date.getMinutes() + date.getHours() * 60;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function deviceUsageToMinutes(devices: Device[], day: Date) {
  const liveUsage: LiveDeviceUsage[] = [];
  devices.forEach((device) => {
    liveUsage.push({
      name: device.name,
      resolution: "1 min",
      data: [],
    });
  });

  const startOfDay = new Date(day);
  startOfDay.setMilliseconds(0);
  startOfDay.setSeconds(0);
  startOfDay.setMinutes(0);
  startOfDay.setHours(0);

  let maxMinutes = 24 * 60;
  const currentTime = new Date();
  if (datesMatch(currentTime, day)) {
    maxMinutes = dateToMin(currentTime);
  }

  for (let minute = 0; minute <= maxMinutes; minute += 1) {
    liveUsage.forEach((liveU) => {
      liveU.data.push({
        x: addMinutes(startOfDay, minute),
        y: 0,
      });
    });
  }

  devices.forEach((device, i) => {
    device.usage.forEach((use) => {
      if (datesMatch(day, new Date(use.date))) {
        const minOfDay = dateToMin(new Date(use.date));
        liveUsage[i].data[minOfDay].y += use.amount;
      }
    });
  });

  let runningTotal: number;
  liveUsage.forEach((liveU) => {
    runningTotal = 0;
    const toRemove: number[] = [];
    liveU.data.forEach((point, i) => {
      if (
        point.y === 0 &&
        dateToMin(point.x) % 30 &&
        dateToMin(point.x) < 24 * 60 - 2 &&
        !(
          datesMatch(currentTime, day) &&
          dateToMin(currentTime) === dateToMin(point.x) + 1
        )
      ) {
        toRemove.push(i);
      } else {
        point.y += runningTotal;
        runningTotal = point.y;
      }
    });
    toRemove.reverse();
    toRemove.forEach((index) => {
      liveU.data.splice(index, 1);
    });
    if (!datesMatch(currentTime, day)) {
      liveU.data.splice(liveU.data.length - 1, 1);
    }
  });

  return liveUsage;
}
