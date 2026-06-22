import { useState, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import StatsPanel from './components/StatsPanel';
import CapabilityCard from './components/CapabilityCard';
import CapabilityModal from './components/CapabilityModal';
import MaterialModal from './components/MaterialModal';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import { useCapabilityStore } from './store/capabilityStore';
import { useAuthStore } from './store/authStore';
import type { Capability, CapabilityCategory, SchemeMaterial } from './types';

function calculateSimilarity(cap: Capability, searchTerm: string): number {
  const lowerTerm = searchTerm.toLowerCase();
  let score = 0;
  
  const name = (cap.name || '').toLowerCase();
  if (name === lowerTerm) score += 100;
  else if (name.includes(lowerTerm)) score += 50;
  
  const desc = (cap.description || '').toLowerCase();
  if (desc.includes(lowerTerm)) score += 30;
  
  const techStack = (cap.techStack || '').toLowerCase();
  if (techStack.includes(lowerTerm)) score += 25;
  
  const subProducts = (cap.subProducts || '').toLowerCase();
  if (subProducts.includes(lowerTerm)) score += 20;
  
  const empoweredScenarios = (cap.empoweredScenarios || '').toLowerCase();
  if (empoweredScenarios.includes(lowerTerm)) score += 20;
  
  const partners = (cap.partners || '').toLowerCase();
  if (partners.includes(lowerTerm)) score += 15;
  
  const preferentialPolicy = (cap.preferentialPolicy || '').toLowerCase();
  if (preferentialPolicy.includes(lowerTerm)) score += 10;
  
  const productPosition = (cap.productPosition || '').toLowerCase();
  if (productPosition.includes(lowerTerm)) score += 10;
  
  const customizable = (cap.customizable || '').toLowerCase();
  if (customizable.includes(lowerTerm)) score += 10;
  
  const remarks = (cap.remarks || '').toLowerCase();
  if (remarks.includes(lowerTerm)) score += 10;
  
  const productManager = (cap.productManager || '').toLowerCase();
  if (productManager.includes(lowerTerm)) score += 15;
  
  const industries = Array.isArray(cap.empoweredIndustries) ? cap.empoweredIndustries : [];
  for (const ind of industries) {
    if ((ind || '').toLowerCase().includes(lowerTerm)) {
      score += 20;
      break;
    }
  }
  
  const contacts = Array.isArray(cap.contacts) ? cap.contacts : [];
  for (const contact of contacts) {
    const contactUnit = (contact.unit || '').toLowerCase();
    const contactName = (contact.name || '').toLowerCase();
    const contactPhone = (contact.phone || '').toLowerCase();
    const contactEmail = (contact.email || '').toLowerCase();
    
    if (contactName === lowerTerm) score += 40;
    else if (contactName.includes(lowerTerm)) score += 25;
    if (contactUnit.includes(lowerTerm)) score += 20;
    if (contactPhone.includes(lowerTerm)) score += 25;
    if (contactEmail.includes(lowerTerm)) score += 20;
  }
  
  const keywords = lowerTerm.split(/\s+/).filter(k => k.length > 0);
  if (keywords.length > 1) {
    let keywordMatches = 0;
    const allText = [
      name, desc, techStack, subProducts, empoweredScenarios, partners,
      preferentialPolicy, productPosition, customizable, remarks, productManager,
      ...industries,
      ...contacts.flatMap(c => [c.unit, c.name, c.phone, c.email])
    ].join(' ').toLowerCase();
    
    for (const kw of keywords) {
      if (allText.includes(kw)) keywordMatches++;
    }
    score += keywordMatches * 5;
  }
  
  return score;
}

function MainPage({ onAdminClick }: { onAdminClick: () => void }) {
  const {
    capabilities,
    addCapability,
    updateCapability,
    deleteCapability,
    addMaterial,
    deleteMaterial,
  } = useCapabilityStore();
  
  const { user } = useAuthStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null);
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CapabilityCategory | 'all'>('all');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSortChange = (field: 'name' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedCapabilities = useMemo(() => {
    let result = [...capabilities];

    if (categoryFilter !== 'all') {
      result = result.filter((cap) => cap.category === categoryFilter);
    }

    if (selectedIndustries.length > 0) {
      result = result.filter((cap) => {
        const capIndustries = Array.isArray(cap.empoweredIndustries) 
          ? cap.empoweredIndustries 
          : (cap.empoweredIndustries ? [cap.empoweredIndustries] : []);
        return selectedIndustries.some((industry) => capIndustries.includes(industry));
      });
    }

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      const scoredResults = result
        .map(cap => ({
          cap,
          score: calculateSimilarity(cap, lowerSearchTerm)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return new Date(b.cap.createdAt).getTime() - new Date(a.cap.createdAt).getTime();
        });
      result = scoredResults.map(item => item.cap);
    } else {
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name, 'zh-CN');
        } else if (sortField === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [capabilities, categoryFilter, selectedIndustries, searchTerm, sortField, sortOrder]);

  const handleAddCapability = (data: Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>) => {
    addCapability(data);
  };

  const handleUpdateCapability = (data: Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCapability) {
      updateCapability(editingCapability.id, data);
      setEditingCapability(null);
    }
  };

  const handleOpenEditModal = (capability: Capability) => {
    setEditingCapability(capability);
    setIsModalOpen(true);
  };

  const handleDeleteCapability = (id: string) => {
    if (confirm('确定要删除这个能力吗？')) {
      deleteCapability(id);
    }
  };

  const handleOpenMaterialModal = (capabilityId: string) => {
    setSelectedCapabilityId(capabilityId);
    setIsMaterialModalOpen(true);
  };

  const handleAddMaterial = (material: Omit<SchemeMaterial, 'id' | 'uploadedAt'>) => {
    if (selectedCapabilityId) {
      addMaterial(selectedCapabilityId, material);
    }
  };

  const handleDeleteMaterial = (capabilityId: string, materialId: string) => {
    if (confirm('确定要删除这个材料吗？')) {
      deleteMaterial(capabilityId, materialId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddClick={() => setIsModalOpen(true)} 
        totalCount={capabilities.length}
        onAdminClick={onAdminClick}
        showAdminButton={user?.role === 'admin'}
      />
      <FilterBar
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        selectedIndustries={selectedIndustries}
        onIndustryChange={setSelectedIndustries}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsPanel capabilities={capabilities} />
        {filteredAndSortedCapabilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedCapabilities.map((capability) => (
              <CapabilityCard
                key={capability.id}
                capability={capability}
                onEdit={() => handleOpenEditModal(capability)}
                onDelete={() => handleDeleteCapability(capability.id)}
                onAddMaterial={() => handleOpenMaterialModal(capability.id)}
                onDeleteMaterial={(materialId) => handleDeleteMaterial(capability.id, materialId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">?</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无能力信息</h3>
            <p className="text-gray-500">点击右上角"新增能力"按钮添加第一个能力</p>
          </div>
        )}
      </main>

      <CapabilityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCapability(null);
        }}
        onSubmit={editingCapability ? handleUpdateCapability : handleAddCapability}
        editData={editingCapability}
      />

      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
          setSelectedCapabilityId(null);
        }}
        onSubmit={handleAddMaterial}
      />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<'main' | 'admin'>('main');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (currentPage === 'admin') {
    return <AdminPanel onBack={() => setCurrentPage('main')} />;
  }

  return <MainPage onAdminClick={() => setCurrentPage('admin')} />;
}

export default App;
