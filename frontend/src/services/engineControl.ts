import axiosClient from "../api/axiosClient";

export interface EngineStatus {
  running: boolean;
  interface?: string;
  capture?: {
    running?: boolean;
    captured_packets?: number;
    [key: string]: unknown;
  };
  queue?: {
    queue_size?: number;
    [key: string]: unknown;
  };
  flows?: Record<string, unknown>;
  error?: string;
  [key: string]: unknown;
}

export const getDetectionEngineStatus = async (): Promise<EngineStatus> => {
  const response = await axiosClient.get("/engine/status");
  return response.data as EngineStatus;
};

export const startDetectionEngine = async (networkInterface?: string) => {
  const params = networkInterface?.trim()
    ? { interface: networkInterface.trim() }
    : undefined;

  const response = await axiosClient.post("/engine/start", null, { params });
  return response.data;
};

export const stopDetectionEngine = async () => {
  const response = await axiosClient.post("/engine/stop");
  return response.data;
};
