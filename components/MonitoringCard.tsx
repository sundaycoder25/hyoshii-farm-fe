import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PicData } from '@/types/monitoring';


interface MonitoringCardProps {
  data: PicData;
}

const MonitoringCard: React.FC<MonitoringCardProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PIC (ID: {data.ID[0]})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Pack A:</span>
            <span className="font-medium">{data["Pack A"][0]}</span>
          </div>
          <div className="flex justify-between">
            <span>Pack B:</span>
            <span className="font-medium">{data["Pack B"][0]}</span>
          </div>
          <div className="flex justify-between">
            <span>Pack C:</span>
            <span className="font-medium">{data["Pack C"][0]}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Gross Weight:</span>
            <span className="font-medium">{data["Gross Weight"][0].toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Reject Weight:</span>
            <span className="font-medium">{data["Reject Weight"][0].toFixed(1)} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringCard;