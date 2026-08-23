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
}
