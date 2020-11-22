import { Device, GroupedUsage, DeviceUsage } from "../models";

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

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
