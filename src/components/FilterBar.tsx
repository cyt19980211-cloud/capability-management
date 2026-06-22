import { ArrowUpDown, Search, X } from 'lucide-react';
import type { CapabilityCategory } from '../types';
import { industryOptions } from '../types';

interface FilterBarProps {
  category: CapabilityCategory | 'all';
  onCategoryChange: (category: CapabilityCategory | 'all') => void;
  selectedIndustries: string[];
  onIndustryChange: (industries: string[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortField: 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: 'name' | 'createdAt') => void;
}

export default function FilterBar({
  category,
  onCategoryChange,
  selectedIndustries,
  onIndustryChange,
  searchTerm,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
}: FilterBarProps) {
  const categories = [
    { key: 'all', label: '全部' },
    { key: 'group', label: '集团能力' },
    { key: 'province', label: '省内能力' },
  ];

  const sortOptions = [
    { key: 'name', label: '名称' },
    { key: 'createdAt', label: '创建时间' },
  ];

  const handleIndustryToggle = (industry: string) => {
    if (industry === 'all') {
      onIndustryChange([]);
    } else {
      if (selectedIndustries.includes(industry)) {
        onIndustryChange(selectedIndustries.filter((i) => i !== industry));
      } else {
        onIndustryChange([...selectedIndustries, industry]);
      }
    }
  };

  const clearIndustries = () => {
    onIndustryChange([]);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索能力名称..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key as CapabilityCategory | 'all')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  category === cat.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">行业:</span>
            <button
              onClick={() => handleIndustryToggle('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedIndustries.length === 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {industryOptions.map((industry) => (
              <button
                key={industry.key}
                onClick={() => handleIndustryToggle(industry.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedIndustries.includes(industry.key)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {industry.label}
              </button>
            ))}
            {selectedIndustries.length > 0 && (
              <button
                onClick={clearIndustries}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
                清除
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">排序:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onSortChange(option.key as 'name' | 'createdAt')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortField === option.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
                {sortField === option.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
