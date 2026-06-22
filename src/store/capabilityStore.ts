import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Capability, CapabilityCategory, SchemeMaterial } from '../types';
import { initialData } from './initialData';

interface CapabilityStore {
  capabilities: Capability[];
  addCapability: (capability: Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCapability: (id: string, updates: Partial<Capability>) => void;
  deleteCapability: (id: string) => void;
  addMaterial: (capabilityId: string, material: Omit<SchemeMaterial, 'id' | 'uploadedAt'>) => void;
  deleteMaterial: (capabilityId: string, materialId: string) => void;
  filterByCategory: (category: CapabilityCategory | 'all') => Capability[];
  sortBy: (field: 'name' | 'createdAt', order: 'asc' | 'desc') => Capability[];
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useCapabilityStore = create<CapabilityStore>()(
  persist(
    (set, get) => ({
      capabilities: initialData,
      addCapability: (capability) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          capabilities: [...state.capabilities, {
            ...capability,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          }],
        }));
      },
      updateCapability: (id, updates) => {
        set((state) => ({
          capabilities: state.capabilities.map((cap) =>
            cap.id === id ? { ...cap, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : cap
          ),
        }));
      },
      deleteCapability: (id) => {
        set((state) => ({
          capabilities: state.capabilities.filter((cap) => cap.id !== id),
        }));
      },
      addMaterial: (capabilityId, material) => {
        const now = new Date().toISOString().split('T')[0];
        set((state) => ({
          capabilities: state.capabilities.map((cap) =>
            cap.id === capabilityId
              ? {
                  ...cap,
                  schemeMaterials: [...cap.schemeMaterials, { ...material, id: generateId(), uploadedAt: now }],
                  updatedAt: now,
                }
              : cap
          ),
        }));
      },
      deleteMaterial: (capabilityId, materialId) => {
        set((state) => ({
          capabilities: state.capabilities.map((cap) =>
            cap.id === capabilityId
              ? {
                  ...cap,
                  schemeMaterials: cap.schemeMaterials.filter((m) => m.id !== materialId),
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : cap
          ),
        }));
      },
      filterByCategory: (category) => {
        const { capabilities } = get();
        if (category === 'all') return capabilities;
        return capabilities.filter((cap) => cap.category === category);
      },
      sortBy: (field, order) => {
        const { capabilities } = get();
        return [...capabilities].sort((a, b) => {
          let comparison = 0;
          if (field === 'name') {
            comparison = a.name.localeCompare(b.name);
          } else if (field === 'createdAt') {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return order === 'asc' ? comparison : -comparison;
        });
      },
    }),
    {
      name: 'capability-storage',
    }
  )
);
