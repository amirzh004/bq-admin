import { BaseApiClient } from "./base"

// Локальные интерфейсы для избежания циклических зависимостей
interface ComplaintBase {
  id: number
  user_id: number
  description: string
  created_at: string
  user: {
    name: string
    surname: string
    email: string
    city_id: number
    avatar_path: string
    review_rating: number
  }
}

interface ServiceComplaint extends ComplaintBase {
  service_id: number
  type: 'service'
}

interface AdComplaint extends ComplaintBase {
  ad_id: number
  type: 'ad'
}

interface WorkComplaint extends ComplaintBase {
  work_id: number
  type: 'work'
}

interface WorkAdComplaint extends ComplaintBase {
  work_ad_id: number
  type: 'work_ad'
}

interface RentComplaint extends ComplaintBase {
  rent_id: number
  type: 'rent'
}

interface RentAdComplaint extends ComplaintBase {
  rent_ad_id: number
  type: 'rent_ad'
}

type Complaint = ServiceComplaint | AdComplaint | WorkComplaint | WorkAdComplaint | RentComplaint | RentAdComplaint
type ComplaintType = 'service' | 'ad' | 'work' | 'work_ad' | 'rent' | 'rent_ad'

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
      endpoint = '/complaints';
      break;
    case 'ad':
      endpoint = '/ad_complaints';
      break;
    case 'work':
      endpoint = '/work_complaints';
      break;
    case 'work_ad':
      endpoint = '/work_ad_complaints';
      break;
    case 'rent':
      endpoint = '/rent_complaints';
      break;
    case 'rent_ad':
      endpoint = '/rent_ad_complaints';
      break;
    default:
      throw new Error(`Unknown complaint type: ${type}`);
  }

  try {
    const complaints = await this.get<Complaint[]>(endpoint);
    return complaints.map(item => ({
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
        endpoint = `/complaints/${id}`;
        break;
      case 'ad':
        endpoint = `/ad_complaints/${id}`;
        break;
      case 'work':
        endpoint = `/work_complaints/${id}`;
        break;
      case 'work_ad':
        endpoint = `/work_ad_complaints/${id}`;
        break;
      case 'rent':
        endpoint = `/rent_complaints/${id}`;
        break;
      case 'rent_ad':
        endpoint = `/rent_ad_complaints/${id}`;
        break;
      default:
        throw new Error(`Unknown complaint type: ${type}`);
    }

    await this.delete(endpoint);
  }
}

export const complaintsApi = new ComplaintsApiClient();