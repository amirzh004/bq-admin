// complaints.ts - полностью переписать
import { BaseApiClient } from "./base"
import type { Complaint, ComplaintType } from "@/lib/types/models"
import { API_CONFIG } from "@/lib/config/api"

export class ComplaintsApiClient extends BaseApiClient {
  async getAllComplaints(): Promise<Complaint[]> {
    try {
      // Делаем параллельные запросы ко всем эндпоинтам
      const [
        serviceComplaints,
        adComplaints, 
        workComplaints,
        workAdComplaints,
        rentComplaints,
        rentAdComplaints
      ] = await Promise.all([
        this.getComplaintsByType('service'),
        this.getComplaintsByType('ad'),
        this.getComplaintsByType('work'),
        this.getComplaintsByType('work_ad'),
        this.getComplaintsByType('rent'),
        this.getComplaintsByType('rent_ad')
      ]);

      // Объединяем все жалобы в один массив
      return [
        ...serviceComplaints,
        ...adComplaints,
        ...workComplaints, 
        ...workAdComplaints,
        ...rentComplaints,
        ...rentAdComplaints
      ];
    } catch (error) {
      console.error("Error loading all complaints:", error);
      throw error;
    }
  }

 async getComplaintsByType(type: ComplaintType): Promise<Complaint[]> {
  let endpoint: string;
  
  switch (type) {
    case 'service':
      endpoint = 'https://api.barlyqqyzmet.kz/complaints';
      break;
    case 'ad':
      endpoint = API_CONFIG.ENDPOINTS.COMPLAINTS.GET_AD;
      break;
    case 'work':
      endpoint = API_CONFIG.ENDPOINTS.COMPLAINTS.GET_WORK;
      break;
    case 'work_ad':
      endpoint = API_CONFIG.ENDPOINTS.COMPLAINTS.GET_WORK_AD;
      break;
    case 'rent':
      endpoint = API_CONFIG.ENDPOINTS.COMPLAINTS.GET_RENT;
      break;
    case 'rent_ad':
      endpoint = API_CONFIG.ENDPOINTS.COMPLAINTS.GET_RENT_AD;
      break;
    default:
      throw new Error(`Unknown complaint type: ${type}`);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Check if response is HTML instead of JSON
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON for endpoint: ${endpoint}`);
    }

    const data = await response.json();
    
    return data.map(item => ({
      ...item,
      type: type
    })) as Complaint[];
  } catch (error) {
    console.error(`Error loading ${type} complaints:`, error);
    return [];
  }
}

  async deleteComplaint(type: ComplaintType, id: number): Promise<void> {
    let endpoint: string;
    
    switch (type) {
      case 'service':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE}/${id}`;
        break;
      case 'ad':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE_AD}/${id}`;
        break;
      case 'work':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE_WORK}/${id}`;
        break;
      case 'work_ad':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE_WORK_AD}/${id}`;
        break;
      case 'rent':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE_RENT}/${id}`;
        break;
      case 'rent_ad':
        endpoint = `${API_CONFIG.ENDPOINTS.COMPLAINTS.DELETE_RENT_AD}/${id}`;
        break;
      default:
        throw new Error(`Unknown complaint type: ${type}`);
    }

    await this.request(endpoint, {
      method: "DELETE",
    });
  }
}

export const complaintsApi = new ComplaintsApiClient();
