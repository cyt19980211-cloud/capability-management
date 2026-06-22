import { Layers, Server, Clock, FileText } from 'lucide-react';
import type { Capability } from '../types';

interface StatsPanelProps {
  capabilities: Capability[];
}

export default function StatsPanel({ capabilities }: StatsPanelProps) {
  const stats = {
    total: capabilities.length,
    group: capabilities.filter((c) => c.category === 'group').length,
    province: capabilities.filter((c) => c.category === 'province').length,
    materials: capabilities.reduce((sum, c) => sum + c.schemeMaterials.length, 0),
  };

  const statCards = [
    { label: '全部能力', value: stats.total, icon: Layers, color: 'bg-indigo-500' },
    { label: '集团能力', value: stats.group, icon: Server, color: 'bg-blue-500' },
    { label: '省内能力', value: stats.province, icon: Server, color: 'bg-green-500' },
    { label: '方案材料', value: stats.materials, icon: FileText, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className={`${card.color} p-2 rounded-lg`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
