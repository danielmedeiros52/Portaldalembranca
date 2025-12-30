import referencesData from '@/data/references.json';

// Types
export interface Memorial {
  id: number;
  slug: string;
  fullName: string;
  birthDate?: string | null;
  deathDate?: string | null;
  birthplace?: string | null;
  parents?: string | null;
  filiation?: string | null;
  biography?: string | null;
  visibility: 'PUBLIC' | 'PRIVATE' | 'public' | 'private';
  status: 'ACTIVE' | 'PENDING_FAMILY_DATA' | 'INACTIVE' | 'active' | 'pending_data' | 'inactive';
  funeralHomeId: number;
  familyUserId?: number | null;
  mainPhoto?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { photos?: number; dedications?: number };
  descendants?: Descendant[];
  photos?: Photo[];
  dedications?: Dedication[];
}

export interface Descendant {
  id: number;
  memorialId: number;
  name: string;
  relationship: string;
  photo?: string;
  createdAt: string;
}

export interface Photo {
  id: number;
  memorialId: number;
  fileUrl: string;
  caption?: string | null;
  order: number;
  createdAt: string;
}

export interface Dedication {
  id: number;
  memorialId: number;
  authorName: string;
  authorPhoto?: string | null;
  message: string;
  createdAt: string;
}

export interface FuneralHome {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reference {
  id: number;
  memorialId: number;
  title: string;
  description: string;
  url: string;
  type:
    | 'article'
    | 'news'
    | 'book'
    | 'document'
    | 'video'
    | 'encyclopedia'
    | 'biography'
    | 'official'
    | 'institution'
    | 'museum'
    | 'academic';
  source: string;
  date?: string | null;
  order: number;
  createdAt: string;
}

const API_BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`.replace(/\+/g, '/'), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro ao comunicar com a API');
  }

  return response.json() as Promise<T>;
}

function normalizeMemorial(memorial: any): Memorial {
  return {
    ...memorial,
    filiation: memorial.filiation ?? memorial.parents ?? null,
    parents: memorial.parents ?? memorial.filiation ?? null,
    visibility: (memorial.visibility || 'PUBLIC') as Memorial['visibility'],
    status: (memorial.status || 'ACTIVE') as Memorial['status'],
    birthDate: memorial.birthDate ? new Date(memorial.birthDate).toISOString() : null,
    deathDate: memorial.deathDate ? new Date(memorial.deathDate).toISOString() : null,
    createdAt: memorial.createdAt ? new Date(memorial.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: memorial.updatedAt ? new Date(memorial.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// Data Service Class
class DataService {
  // Memorials
  async getMemorials(params?: { funeralHomeId?: number; familyUserId?: number }): Promise<Memorial[]> {
    const query = new URLSearchParams();
    if (params?.funeralHomeId) query.set('funeralHomeId', String(params.funeralHomeId));
    if (params?.familyUserId) query.set('familyUserId', String(params.familyUserId));

    const data = await apiFetch<any[]>(`/memorials${query.toString() ? `?${query.toString()}` : ''}`);
    return data.map(normalizeMemorial);
  }

  async getMemorialById(id: number): Promise<Memorial | undefined> {
    try {
      const memorial = await apiFetch<any>(`/memorials/${id}`);
      return normalizeMemorial(memorial);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getMemorialBySlug(slug: string): Promise<Memorial | undefined> {
    try {
      const memorial = await apiFetch<any>(`/memorials/by-slug/${slug}`);
      return normalizeMemorial(memorial);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async getMemorialsByFuneralHomeId(funeralHomeId: number): Promise<Memorial[]> {
    return this.getMemorials({ funeralHomeId });
  }

  async getMemorialsByFamilyUserId(familyUserId: number): Promise<Memorial[]> {
    return this.getMemorials({ familyUserId });
  }

  async createMemorial(payload: {
    fullName: string;
    birthDate?: string;
    deathDate?: string;
    birthplace?: string;
    parents?: string;
    biography?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    funeralHomeId: number;
    familyUserId?: number;
  }): Promise<Memorial> {
    const memorial = await apiFetch<any>('/memorials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeMemorial(memorial);
  }

  async updateMemorial(id: number, payload: Partial<Omit<Memorial, 'id' | 'slug'>>): Promise<Memorial> {
    const memorial = await apiFetch<any>(`/memorials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeMemorial(memorial);
  }

  // Descendants
  async getDescendantsByMemorialId(memorialId: number): Promise<Descendant[]> {
    const memorial = await this.getMemorialById(memorialId);
    return memorial?.descendants || [];
  }

  // Photos
  async getPhotosByMemorialId(memorialId: number): Promise<Photo[]> {
    const memorial = await this.getMemorialById(memorialId);
    return memorial?.photos?.sort((a, b) => a.order - b.order) || [];
  }

  // Dedications
  async getDedicationsByMemorialId(memorialId: number): Promise<Dedication[]> {
    const data = await apiFetch<Dedication[]>(`/dedications?memorialId=${memorialId}`);
    return data.map(d => ({ ...d, createdAt: new Date(d.createdAt).toISOString() }));
  }

  async createDedication(input: { memorialId: number; authorName: string; message: string }): Promise<Dedication> {
    const dedication = await apiFetch<Dedication>('/dedications', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { ...dedication, createdAt: new Date(dedication.createdAt).toISOString() };
  }

  // Funeral Homes / Family Users (placeholder until dedicated APIs exist)
  async getFuneralHomeById(_id: number): Promise<FuneralHome | undefined> {
    return undefined;
  }

  async getFamilyUserById(_id: number): Promise<FamilyUser | undefined> {
    return undefined;
  }

  // References (Documentary Sources)
  async getReferences(): Promise<Reference[]> {
    return referencesData.references as Reference[];
  }

  async getReferencesByMemorialId(memorialId: number): Promise<Reference[]> {
    const references = await this.getReferences();
    return references.filter(r => r.memorialId === memorialId).sort((a, b) => a.order - b.order);
  }

  // Statistics
  async getStats() {
    const memorials = await this.getMemorials();
    const dedications = await Promise.all(memorials.map(m => this.getDedicationsByMemorialId(m.id)));
    const photos: Photo[] = (await Promise.all(memorials.map(m => this.getPhotosByMemorialId(m.id))))
      .flat();

    return {
      totalMemorials: memorials.length,
      activeMemorials: memorials.filter(m => (m.status ?? '').toString().toLowerCase().includes('active')).length,
      totalDedications: dedications.flat().length,
      totalPhotos: photos.length,
    };
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export default for convenience
export default dataService;
