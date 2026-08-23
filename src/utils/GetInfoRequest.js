import Request from "./Request";
import { normalizeUserData } from "./dataAdapter";

export default class GetInfoRequest extends Request {
  static async getInfo() {
    const pathname = `${
      import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin
    }${window.location.pathname.split("#")[0]}`;

    try {
      const response = await GetInfoRequest.send(
        `${pathname}/info`,
        "GET",
        {},
        {
          toastError: true,
        }
      );
      // Normalize the response to a consistent internal shape
      if (response?.data) {
        response.data = normalizeUserData(response.data);
      }
      return response;
    } catch (error) {
      console.error("Error fetching info:", error);
      throw error;
    }
  }

  static async getConfigs() {
    const pathname = `${
      import.meta.env?.VITE_PANEL_DOMAIN ?? window.location.origin
    }${window.location.pathname.split("#")[0]}`;

    try {
      const response = await GetInfoRequest.send(
        `${pathname}`,
        "GET",
        {},
        {
          toastError: true,
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching info:", error);
      throw error;
    }
  }

  static async getUsage(period = "day", start, end) {
    const origin =
      import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin;
    const pathname = window.location.pathname.split("#")[0];
    const basePath = `${origin}${pathname}`
      .replace(/\/info\/?$/, "")
      .replace(/\/$/, "");

    const params = new URLSearchParams({ period });
    if (start) {
      params.append(
        "start",
        start instanceof Date ? start.toISOString() : start
      );
    }
    if (end) {
      params.append("end", end instanceof Date ? end.toISOString() : end);
    }

    try {
      const response = await GetInfoRequest.send(
        `${basePath}/usage?${params.toString()}`,
        "GET",
        {},
        {
          toastError: false,
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      throw error;
    }
  }
}

