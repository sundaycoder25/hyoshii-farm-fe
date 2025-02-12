import React, { useEffect, useState } from "react";
import MonitoringCard from "./MonitoringCard";
import WeightChart from "./WeightChart";
import MonitoringTable from "./MonitoringTable";
import { createWebSocketClient } from "../services/websocket";
import { fetchHistoricalData } from "../services/api";
import { PicData, HistoricalData } from "../types/monitoring";

const MAX_HISTORY = 10;

const Dashboard = () => {
  const [picDataMap, setPicDataMap] = useState<Map<number, PicData>>(new Map());
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tableData, setTableData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // Get all active PIC IDs from MQTT data
  const activePicIds = Array.from(picDataMap.keys()).sort((a, b) => a - b);

  useEffect(() => {
    const loadHistoricalData = async () => {
      const data = await fetchHistoricalData();
      const latest20Records = Array.isArray(data) ? data.slice(0, 20) : [];
      setTableData(latest20Records);
    };

    loadHistoricalData();
    const interval = setInterval(loadHistoricalData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMessage = (data: PicData) => {
      // Update PIC data
      setPicDataMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(data.ID[0], data);
        return newMap;
      });

      // Update historical data
      setHistoricalData((prev) => {
        const newData = [...prev];
        const timestamp = new Date(data.ts).toLocaleTimeString();
        const existingIndex = newData.findIndex(
          (item) => item.timestamp === timestamp
        );

        if (existingIndex !== -1) {
          newData[existingIndex][`pic${data.ID[0]}GrossWeight`] = Number(
            data["Gross Weight"][0].toFixed(1)
          );
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newEntry: any = { timestamp };
          Array.from(picDataMap.keys()).forEach((picId) => {
            newEntry[`pic${picId}GrossWeight`] =
              picId === data.ID[0]
                ? Number(data["Gross Weight"][0].toFixed(1))
                : prev[prev.length - 1]?.[`pic${picId}GrossWeight`] || 0;
          });
          // Add the new PIC if it's not in previous data
          if (!picDataMap.has(data.ID[0])) {
            newEntry[`pic${data.ID[0]}GrossWeight`] = Number(
              data["Gross Weight"][0].toFixed(1)
            );
          }
          newData.push(newEntry);

          if (newData.length > MAX_HISTORY) {
            newData.shift();
          }
        }
        return newData;
      });

      // Update table data
      setTableData((prev) => {
        const newRecord = {
          timestamp: data.ts,
          picId: data.ID[0],
          packA: data["Pack A"][0],
          packB: data["Pack B"][0],
          packC: data["Pack C"][0],
          grossWeight: data["Gross Weight"][0],
          rejectWeight: data["Reject Weight"][0],
        };

        const newData = [newRecord, ...prev.slice(0, 19)];
        return newData;
      });
    };

    const client = createWebSocketClient(handleMessage, setConnectionStatus);
    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [picDataMap]);

  const renderPicCards = () => {
    if (picDataMap.size === 0) {
      return (
        <div className="col-span-3 text-center text-gray-500">
          Waiting for PIC data...
        </div>
      );
    }

    return Array.from(picDataMap.entries())
      .sort(([idA], [idB]) => idA - idB)
      .map(([id, data]) => <MonitoringCard key={id} data={data} />);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">PIC Monitoring</h1>
        <div
          className={`px-3 py-1 rounded-full text-sm ${
            connectionStatus === "Connected"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {connectionStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {renderPicCards()}
      </div>

      <div className="space-y-6">
        <WeightChart data={historicalData} activePicIds={activePicIds} />
        <MonitoringTable data={tableData} />
      </div>
    </div>
  );
};

export default Dashboard;
