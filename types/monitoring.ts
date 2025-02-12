export type PicData = {
  ID: number[];
  "Pack A": number[];
  "Pack B": number[];
  "Pack C": number[];
  "Gross Weight": number[];
  "Reject Weight": number[];
  ts: string;
};

export type HistoricalData = {
  timestamp: string;
  [key: string]: number | string; // Dynamic keys for PIC weights
};

// Default values when no data available
export const DEFAULT_PIC_DATA: PicData = {
  ID: [0],
  "Pack A": [0],
  "Pack B": [0],
  "Pack C": [0],
  "Gross Weight": [0],
  "Reject Weight": [0],
  ts: new Date().toISOString(),
};

// Colors for chart lines
export const CHART_COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#ff7300", // Orange
  "#0088fe", // Blue
];
