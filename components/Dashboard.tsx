import React, { useEffect, useState } from "react";
import MonitoringCard from "./MonitoringCard";
import WeightChart from "./WeightChart";
import MonitoringTable from "./MonitoringTable";
import { createWebSocketClient } from "../services/websocket";
import { fetchHistoricalData } from "../services/api";
import { PicData, HistoricalData, DEFAULT_PIC_DATA } from "../types/monitoring";

const MAX_HISTORY = 10;

// Inisialisasi untuk 3 PIC
const INITIAL_PIC_IDS = [556, 331, 512]; // Sesuaikan dengan ID PIC yang digunakan

const Dashboard = () => {
  // Inisialisasi state dengan 3 PIC
  const [picDataMap, setPicDataMap] = useState<Map<number, PicData>>(() => {
    const initialMap = new Map();
    INITIAL_PIC_IDS.forEach((id) => {
      initialMap.set(id, {
        ...DEFAULT_PIC_DATA,
        ID: [id],
        ts: new Date().toISOString(),
      });
    });
    return initialMap;
  });

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tableData, setTableData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const activePicIds = INITIAL_PIC_IDS; // Gunakan ID yang telah ditentukan

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
      const picId = data.ID[0];

      // Update PIC data sambil mempertahankan data PIC lainnya
      setPicDataMap((prevMap) => {
        const newMap = new Map(prevMap);
        if (INITIAL_PIC_IDS.includes(picId)) {
          newMap.set(picId, {
            ...data,
            ts: new Date(data.ts).toISOString(),
          });
        }
        return newMap;
      });

      // Update historical data untuk semua PIC
      setHistoricalData((prev) => {
        const newData = [...prev];
        const timestamp = new Date(data.ts).toLocaleTimeString();
        const existingIndex = newData.findIndex(
          (item) => item.timestamp === timestamp
        );

        if (existingIndex !== -1) {
          const updatedEntry = { ...newData[existingIndex] };
          updatedEntry[`pic${picId}GrossWeight`] = Number(
            data["Gross Weight"][0].toFixed(1)
          );
          newData[existingIndex] = updatedEntry;
        } else {
          const newEntry: HistoricalData = { timestamp };
          INITIAL_PIC_IDS.forEach((id) => {
            newEntry[`pic${id}GrossWeight`] =
              id === picId
                ? Number(data["Gross Weight"][0].toFixed(1))
                : prev[prev.length - 1]?.[`pic${id}GrossWeight`] || 0;
          });
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
          picId: picId,
          packA: data["Pack A"][0],
          packB: data["Pack B"][0],
          packC: data["Pack C"][0],
          grossWeight: data["Gross Weight"][0],
          rejectWeight: data["Reject Weight"][0],
        };
        return [newRecord, ...prev.slice(0, 19)];
      });
    };

    const client = createWebSocketClient(handleMessage, setConnectionStatus);
    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  const renderPicCards = () => {
    if (picDataMap.size === 0) {
      return (
        <div className="col-span-3 text-center text-gray-500">
          Waiting for PIC data...
        </div>
      );
    }

    // Render card untuk setiap PIC yang telah ditentukan
    return INITIAL_PIC_IDS.map((id) => (
      <MonitoringCard
        key={id}
        data={
          picDataMap.get(id) || {
            ...DEFAULT_PIC_DATA,
            ID: [id],
            ts: new Date().toISOString(),
          }
        }
      />
    ));
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
