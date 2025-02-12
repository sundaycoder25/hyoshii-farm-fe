import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoricalData, CHART_COLORS, KNOWN_PIC_IDS } from '../types/monitoring';

interface WeightChartProps {
  data: HistoricalData[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gross Weight Comparison (Last 10 Records)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                label={{ value: 'Time', position: 'bottom' }}
              />
              <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              {KNOWN_PIC_IDS.map((picId) => (
                <Line 
                  key={picId}
                  type="monotone" 
                  dataKey={`pic${picId}GrossWeight`}
                  name={`PIC ${picId} Weight`}
                  stroke={CHART_COLORS[picId]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightChart;