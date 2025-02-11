import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type PicData = {
  ID: number[];
  "Pack A": number[];
  "Pack B": number[];
  "Pack C": number[];
  "Gross Weight": number[];
  "Reject Weight": number[];
  ts: string;
};

type HistoricalData = {
  timestamp: string;
  pic1GrossWeight: number;
  pic2GrossWeight: number;
};

const MAX_HISTORY = 10;

const Dashboard = () => {
  const [pic1Data, setPic1Data] = useState<PicData | null>(null);
  const [pic2Data, setPic2Data] = useState<PicData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const updateHistoricalData = (data: PicData) => {
    setHistoricalData(prev => {
      const newData = [...prev];
      const timestamp = new Date(data.ts).toLocaleTimeString();

      // Jika data dengan timestamp yang sama sudah ada, update nilainya
      const existingIndex = newData.findIndex(item => item.timestamp === timestamp);
      
      if (existingIndex !== -1) {
        if (data.ID[0] === 556) {
          newData[existingIndex].pic1GrossWeight = Number(data["Gross Weight"][0].toFixed(1));
        } else if (data.ID[0] === 331) {
          newData[existingIndex].pic2GrossWeight = Number(data["Gross Weight"][0].toFixed(1));
        }
      } else {
        // Tambah data baru
        newData.push({
          timestamp,
          pic1GrossWeight: data.ID[0] === 556 ? Number(data["Gross Weight"][0].toFixed(1)) : 0,
          pic2GrossWeight: data.ID[0] === 331 ? Number(data["Gross Weight"][0].toFixed(1)) : 0,
        });

        // Jika melebihi MAX_HISTORY, hapus data paling lama
        if (newData.length > MAX_HISTORY) {
          newData.shift();
        }
      }

      return newData;
    });
  };

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stompClient.onConnect = (frame) => {
      setConnectionStatus('Connected');

      stompClient.subscribe('/topic/plc-monitoring', (message) => {
        try {
          const data = JSON.parse(message.body) as PicData;
          
          if (data.ID[0] === 556) {
            setPic1Data(data);
          } else if (data.ID[0] === 331) {
            setPic2Data(data);
          }

          updateHistoricalData(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setConnectionStatus('Error');
    };

    stompClient.onWebSocketClose = () => {
      setConnectionStatus('Disconnected');
    };

    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, []);

  const renderPicData = (data: PicData | null) => {
    if (!data) return null;

    return (
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
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">PIC Monitoring</h1>
        <div className={`px-3 py-1 rounded-full text-sm ${
          connectionStatus === 'Connected' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {connectionStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* PIC 1 Card */}
        <Card>
          <CardHeader>
            <CardTitle>PIC 1 (ID: {pic1Data?.ID[0] || '556'})</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPicData(pic1Data)}
          </CardContent>
        </Card>

        {/* PIC 2 Card */}
        <Card>
          <CardHeader>
            <CardTitle>PIC 2 (ID: {pic2Data?.ID[0] || '331'})</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPicData(pic2Data)}
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gross Weight Comparison (Last 10 Records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  label={{ value: 'Time', position: 'bottom' }}
                />
                <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pic1GrossWeight" 
                  name="PIC 1 Weight" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="pic2GrossWeight" 
                  name="PIC 2 Weight" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;