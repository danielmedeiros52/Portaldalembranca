/**
 * Data Service Layer
 * 
 * This service abstracts data fetching from the API and fallback JSON files.
 * For memorials, it fetches from the database via tRPC API.
 * For demo memorial and other data, it uses local JSON files.
 */

import { trpc } from '@/lib/trpc';
import descendantsData from '@/data/descendants.json';
import photosData from '@/data/photos.json';
import dedicationsData from '@/data/dedications.json';
import funeralHomesData from '@/data/funeralHomes.json';
import familyUsersData from '@/data/familyUsers.json';
import referencesData from '@/data/references.json';

// Demo memorial data (hardcoded for demonstration purposes)
const demoMemorial = {
  id: 0,
  slug: "demonstracao",
  fullName: "Memorial Demonstração",
  birthDate: "1950-01-01",
  deathDate: "2024-01-01",
  birthplace: "Recife, Pernambuco",
  filiation: "Demonstração de filiação",
  biography: `Este é um memorial de demonstração para mostrar as funcionalidades do Portal da Lembrança.

O Portal da Lembrança é uma plataforma digital que permite criar memoriais virtuais para homenagear entes queridos. Com QR Codes que podem ser afixados em lápides, os visitantes podem acessar a história de vida, fotos e mensagens de carinho deixadas por familiares e amigos.

Este memorial demonstra como as informações são apresentadas, incluindo biografia, galeria de fotos, linha do tempo e espaço para dedicatórias.`,
  visibility: "public" as const,
  status: "active" as const,
  funeralHomeId: null,
  familyUserId: null,
  mainPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  isHistorical: false,
  category: null,
  graveLocation: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

// Types
export interface Memorial {
  id: number;
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  birthplace: string;
  filiation: string;
  biography: string;
  visibility: 'public' | 'private';
  status: 'active' | 'pending_data' | 'inactive';
  funeralHomeId: number | null;
  familyUserId: number | null;
  mainPhoto?: string | null;
  isHistorical?: boolean;
  category?: string | null;
  graveLocation?: string | null;
  createdAt: string;
  updatedAt: string;
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
  caption: string;
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
  phone: string;
  address: string;
  logo?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyUser {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  type: 'article' | 'news' | 'book' | 'document' | 'video' | 'encyclopedia' | 'biography' | 'official' | 'institution' | 'museum' | 'academic';
  source: string;
  date?: string | null;
  order: number;
  createdAt: string;
}

// Data Service Class
class DataService {
  private memorialsCache: Memorial[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute cache

  // Memorials - fetch from API
  async getMemorials(): Promise<Memorial[]> {
    // Check cache
    const now = Date.now();
    if (this.memorialsCache && (now - this.lastFetch) < this.CACHE_TTL) {
      return this.memorialsCache;
    }

    try {
      // Fetch from API
      const apiMemorials = await trpc.memorial.getPublicMemorials.query();
      
      // Transform API response to match Memorial interface
      const memorials: Memorial[] = apiMemorials.map((m: any) => ({
        id: m.id,
        slug: m.slug,
        fullName: m.fullName,
        birthDate: m.birthDate || '',
        deathDate: m.deathDate || '',
        birthplace: m.birthplace || '',
        filiation: m.filiation || '',
        biography: m.biography || '',
        visibility: m.visibility,
        status: m.status,
        funeralHomeId: m.funeralHomeId,
        familyUserId: m.familyUserId,
        mainPhoto: m.mainPhoto,
        isHistorical: m.isHistorical || false,
        category: m.category,
        graveLocation: m.graveLocation,
        createdAt: m.createdAt?.toISOString?.() || m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt?.toISOString?.() || m.updatedAt || new Date().toISOString(),
      }));

      // Add demo memorial
      memorials.unshift(demoMemorial);

      this.memorialsCache = memorials;
      this.lastFetch = now;
      return memorials;
    } catch (error) {
      console.warn('[DataService] Failed to fetch memorials from API, using demo only:', error);
      // Return only demo memorial on error
      return [demoMemorial];
    }
  }

  async getMemorialById(id: number): Promise<Memorial | undefined> {
    if (id === 0) return demoMemorial;
    const memorials = await this.getMemorials();
    return memorials.find(m => m.id === id);
  }

  async getMemorialBySlug(slug: string): Promise<Memorial | undefined> {
    if (slug === 'demonstracao') return demoMemorial;
    
    try {
      // Try to fetch directly from API for better accuracy
      const memorial = await trpc.memorial.getBySlug.query({ slug });
      if (memorial) {
        return {
          id: memorial.id,
          slug: memorial.slug,
          fullName: memorial.fullName,
          birthDate: memorial.birthDate || '',
          deathDate: memorial.deathDate || '',
          birthplace: memorial.birthplace || '',
          filiation: memorial.filiation || '',
          biography: memorial.biography || '',
          visibility: memorial.visibility,
          status: memorial.status,
          funeralHomeId: memorial.funeralHomeId,
          familyUserId: memorial.familyUserId,
          mainPhoto: (memorial as any).mainPhoto,
          isHistorical: (memorial as any).isHistorical || false,
          category: (memorial as any).category,
          graveLocation: (memorial as any).graveLocation,
          createdAt: (memorial as any).createdAt?.toISOString?.() || (memorial as any).createdAt || new Date().toISOString(),
          updatedAt: (memorial as any).updatedAt?.toISOString?.() || (memorial as any).updatedAt || new Date().toISOString(),
        };
      }
    } catch (error) {
      console.warn('[DataService] Failed to fetch memorial by slug:', error);
    }
    
    // Fallback to cached list
    const memorials = await this.getMemorials();
    return memorials.find(m => m.slug === slug);
  }

  async getMemorialsByFuneralHomeId(funeralHomeId: number): Promise<Memorial[]> {
    const memorials = await this.getMemorials();
    return memorials.filter(m => m.funeralHomeId === funeralHomeId);
  }

  async getMemorialsByFamilyUserId(familyUserId: number): Promise<Memorial[]> {
    const memorials = await this.getMemorials();
    return memorials.filter(m => m.familyUserId === familyUserId);
  }

  // Clear cache (useful after mutations)
  clearCache() {
    this.memorialsCache = null;
    this.lastFetch = 0;
  }

  // Descendants
  async getDescendants(): Promise<Descendant[]> {
    return descendantsData.descendants as Descendant[];
  }

  async getDescendantsByMemorialId(memorialId: number): Promise<Descendant[]> {
    const descendants = await this.getDescendants();
    return descendants.filter(d => d.memorialId === memorialId);
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return photosData.photos as Photo[];
  }

  async getPhotosByMemorialId(memorialId: number): Promise<Photo[]> {
    const photos = await this.getPhotos();
    return photos.filter(p => p.memorialId === memorialId).sort((a, b) => a.order - b.order);
  }

  // Dedications
  async getDedications(): Promise<Dedication[]> {
    return dedicationsData.dedications as Dedication[];
  }

  async getDedicationsByMemorialId(memorialId: number): Promise<Dedication[]> {
    const dedications = await this.getDedications();
    return dedications
      .filter(d => d.memorialId === memorialId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Funeral Homes
  async getFuneralHomes(): Promise<FuneralHome[]> {
    return funeralHomesData.funeralHomes as FuneralHome[];
  }

  async getFuneralHomeById(id: number): Promise<FuneralHome | undefined> {
    const funeralHomes = await this.getFuneralHomes();
    return funeralHomes.find(f => f.id === id);
  }

  // Family Users
  async getFamilyUsers(): Promise<FamilyUser[]> {
    return familyUsersData.familyUsers as FamilyUser[];
  }

  async getFamilyUserById(id: number): Promise<FamilyUser | undefined> {
    const familyUsers = await this.getFamilyUsers();
    return familyUsers.find(f => f.id === id);
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
    const dedications = await this.getDedications();
    const photos = await this.getPhotos();

    return {
      totalMemorials: memorials.length,
      activeMemorials: memorials.filter(m => m.status === 'active').length,
      totalDedications: dedications.length,
      totalPhotos: photos.length,
    };
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export default for convenience
export default dataService;
