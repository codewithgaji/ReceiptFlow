import { Receipt, ReceiptCreate, ReceiptCreateResponse } from "@/types/receipt";

// API Base URL - Change this to your production URL when deploying
export const API_BASE_URL = "https://receiptflow-production.up.railway.app";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = "An error occurred";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      // Handle specific status codes
      if (response.status === 409) {
        throw new Error("Duplicate order ID. A receipt with this order ID already exists.");
      }
      if (response.status === 400) {
        throw new Error(`Validation error: ${errorMessage}`);
      }
      if (response.status === 404) {
        throw new Error("Resource not found.");
      }
      if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async createReceipt(data: ReceiptCreate): Promise<ReceiptCreateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/payment-success/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return this.handleResponse<ReceiptCreateResponse>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "⚠️ Backend not connected. Make sure FastAPI is running on Railway"
        );
      }
      throw error;
    }
  }

  async getAllReceipts(): Promise<Receipt[]> {
    try {
      const response = await fetch(`${this.baseUrl}/receipts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return this.handleResponse<Receipt[]>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "⚠️ Backend not connected. Make sure FastAPI is running on Railway"
        );
      }
      throw error;
    }
  }

  async getReceiptById(receiptId: number): Promise<Receipt> {
    try {
      const response = await fetch(`${this.baseUrl}/receipts/${receiptId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return this.handleResponse<Receipt>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          "⚠️ Backend not connected. Make sure FastAPI is running on Railway"
        );
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();
