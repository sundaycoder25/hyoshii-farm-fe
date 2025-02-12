import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HistoricalData, CHART_COLORS } from "../types/monitoring";

interface WeightChartProps {
  data: HistoricalData[];
  activePicIds: number[];
}

const WeightChart: React.FC<WeightChartProps> = ({ data, activePicIds }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gross Weight Comparison (Last 10 Records)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          {" "}
          {/* Menambah tinggi chart container */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }} // Menambah margin bawah
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                label={{
                  value: "Time",
                  position: "bottom",
                  offset: 40, // Menambah jarak label dari axis
                }}
              />
              <YAxis
                label={{
                  value: "Weight (kg)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -5,
                }}
              />
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36} // Menambah tinggi area legend
                wrapperStyle={{
                  paddingTop: "20px", // Menambah padding atas legend
                  bottom: "0px", // Memastikan legend di posisi paling bawah
                }}
              />
              {activePicIds.map((picId, index) => (
                <Line
                  key={picId}
                  type="monotone"
                  dataKey={`pic${picId}GrossWeight`}
                  name={`PIC ${picId} Weight`}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
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
