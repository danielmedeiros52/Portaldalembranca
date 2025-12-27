/**
 * Data Service Layer
 * 
 * This service abstracts data fetching from JSON files.
 * To switch to API calls, simply replace the import statements
 * with fetch() calls to your API endpoints.
 * 
 * Example API migration:
 * Instead of: import memorialsData from '@/data/memorials.json'
 * Use: const memorialsData = await fetch('/api/memorials').then(r => r.json())
 */

import memorialsData from '@/data/memorials.json';
import descendantsData from '@/data/descendants.json';
import photosData from '@/data/photos.json';
import dedicationsData from '@/data/dedications.json';
import funeralHomesData from '@/data/funeralHomes.json';
import familyUsersData from '@/data/familyUsers.json';

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
  funeralHomeId: number;
  familyUserId: number;
  mainPhoto?: string;
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

// Data Service Class
class DataService {
  // Memorials
  async getMemorials(): Promise<Memorial[]> {
    // TODO: Replace with API call
    // return fetch('/api/memorials').then(r => r.json());
    return memorialsData.memorials as Memorial[];
  }

  async getMemorialById(id: number): Promise<Memorial | undefined> {
    const memorials = await this.getMemorials();
    return memorials.find(m => m.id === id);
  }

  async getMemorialBySlug(slug: string): Promise<Memorial | undefined> {
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
