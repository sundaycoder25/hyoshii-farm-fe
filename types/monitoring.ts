// Raw data structure from WebSocket
export type PicData = {
    ID: number[];
    "Pack A": number[];
    "Pack B": number[];
    "Pack C": number[];
    "Gross Weight": number[];
    "Reject Weight": number[];
    ts: string;
  };
  
  // Historical data for charting
  export type HistoricalData = {
    timestamp: string;
    [key: string]: number | string; // Dynamic keys for each PIC's weight (e.g., pic556GrossWeight)
  };
  
  // Default values for PIC data when no data is received
  export const DEFAULT_PIC_DATA: PicData = {
    ID: [0],
    "Pack A": [0],
    "Pack B": [0],
    "Pack C": [0],
    "Gross Weight": [0],
    "Reject Weight": [0],
    ts: new Date().toISOString()
  };
  
  // Known PIC IDs in the system
  export const KNOWN_PIC_IDS = [556, 331, 789] as const;
  
  // Color configuration for charts
  export const CHART_COLORS = {
    556: '#8884d8', // Purple for PIC 1
    331: '#82ca9d', // Green for PIC 2
    789: '#ffc658'  // Yellow for PIC 3
  } as const;
  
  // Connection status types
  export type ConnectionStatus = 'Connecting...' | 'Connected' | 'Disconnected' | 'Error';
  
  // Chart configuration types
  export type ChartConfig = {
    maxHistory: number;
    refreshInterval: number;
    chartHeight: number;
  };
  
  // Default chart configuration
  export const DEFAULT_CHART_CONFIG: ChartConfig = {
    maxHistory: 10,
    refreshInterval: 5000, // 5 seconds
    chartHeight: 400
  };