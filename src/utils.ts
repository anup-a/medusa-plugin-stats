import { endOfDay, format, startOfDay } from "date-fns";
import { Between } from "typeorm";

export type PeriodType = "day" | "month" | "year" | "week";

export enum EDateType {
  Date = "MM-dd-yyyy",
  Datetime = "yyyy-MM-dd HH:mm:ss",
}

export const transformTimeSeries = (
  timeSeries: { timestamp: Date; value: string }[]
): { timeseries: { [key: string]: number } } => {
  const timeSeriesMap = {};
  timeSeries.forEach((t) => {
    const timestamp = t.timestamp;

    const date = format(timestamp, EDateType.Date);
    const value = getNumericValue(t.value);
    timeSeriesMap[date] = value;
  });
  return { timeseries: timeSeriesMap };
};

export const getNumericValue = (value: string, isFloat = false): number => {
  try {
    if (!isFloat) {
      return parseFloat(value);
    }
    return parseInt(value);
  } catch (e) {
    return null;
  }
};

export const BetweenDate = (from: Date, end: Date, type: EDateType) => {
  return Between(format(startOfDay(from), type), format(endOfDay(end), type));
};
