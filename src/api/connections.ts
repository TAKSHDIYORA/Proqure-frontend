import { api } from "./client";

export interface ConnectedOrg {
  _id: string;
  name: string;
  email?: string;
  capabilities: string[];
}

export interface Connection {
  _id: string;
  requesterOrganizationId: ConnectedOrg;
  receiverOrganizationId: ConnectedOrg;
  requestedBy: string;
  respondedBy?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const connectionsApi = {
  getMyConnections: async (): Promise<{
    count: number;
    connections: Connection[];
  }> => {
    const res = await api.get("/connections");
    return res.data;
  },

  sendConnectionRequest: async (
    organizationId: string
  ): Promise<{ message: string; connection: Connection }> => {
    const res = await api.post(`/connections/request/${organizationId}`);
    return res.data;
  },

  acceptConnectionRequest: async (
    id: string
  ): Promise<{ message: string; connection: Connection }> => {
    const res = await api.patch(`/connections/${id}/accept`);
    return res.data;
  },

  rejectConnectionRequest: async (
    id: string
  ): Promise<{ message: string; connection: Connection }> => {
    const res = await api.patch(`/connections/${id}/reject`);
    return res.data;
  },
};
