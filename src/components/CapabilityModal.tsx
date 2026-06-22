import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Capability, CapabilityCategory, SchemeMaterial, ContactPerson } from '../types';
import { categoryMap, industryOptions } from '../types';

interface CapabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editData?: Capability | null;
}

const generateContactId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const createEmptyContact = (): ContactPerson => ({
  id: generateContactId(),
  unit: '',
  name: '',
  phone: '',
  email: '',
});

export default function CapabilityModal({ isOpen, onClose, onSubmit, editData }: CapabilityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'group' as CapabilityCategory,
    description: '',
    status: 'online' as const,
    techStack: '',
    schemeMaterials: [] as SchemeMaterial[],
    subProducts: '',
    empoweredIndustries: [] as string[],
    empoweredScenarios: '',
    partners: '',
    contacts: [createEmptyContact()] as ContactPerson[],
    preferentialPolicy: '',
    productPosition: '',
    customizable: '',
    remarks: '',
    productManager: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        category: editData.category,
        description: editData.description,
        status: 'online',
        techStack: editData.techStack,
        schemeMaterials: editData.schemeMaterials || [],
        subProducts: editData.subProducts || '',
        empoweredIndustries: Array.isArray(editData.empoweredIndustries) 
          ? editData.empoweredIndustries 
          : (editData.empoweredIndustries ? [editData.empoweredIndustries] : []),
        empoweredScenarios: editData.empoweredScenarios || '',
        partners: editData.partners || '',
        contacts: Array.isArray(editData.contacts) && editData.contacts.length > 0
          ? editData.contacts
          : [createEmptyContact()],
        preferentialPolicy: editData.preferentialPolicy || '',
        productPosition: editData.productPosition || '',
        customizable: editData.customizable || '',
        remarks: editData.remarks || '',
        productManager: editData.productManager || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'group',
        description: '',
        status: 'online',
        techStack: '',
        schemeMaterials: [],
        subProducts: '',
        empoweredIndustries: [],
        empoweredScenarios: '',
        partners: '',
        contacts: [createEmptyContact()],
        preferentialPolicy: '',
        productPosition: '',
        customizable: '',
        remarks: '',
        productManager: '',
      });
    }
  }, [editData, isOpen]);

  const handleIndustryToggle = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      empoweredIndustries: prev.empoweredIndustries.includes(industry)
        ? prev.empoweredIndustries.filter((i) => i !== industry)
        : [...prev.empoweredIndustries, industry],
    }));
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, createEmptyContact()],
    }));
  };

  const removeContact = (contactId: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.length > 1 
        ? prev.contacts.filter((c) => c.id !== contactId)
        : prev.contacts,
    }));
  };

  const updateContact = (contactId: string, field: keyof ContactPerson, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) =>
        c.id === contactId ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validContacts = formData.contacts.filter(
      (c) => c.name.trim() || c.phone.trim() || c.email.trim()
    );
    onSubmit({ 
      ...formData, 
      schemeMaterials: formData.schemeMaterials,
      contacts: validContacts.length > 0 ? validContacts : [],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {editData ? '编辑能力' : '新增能力'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">能力名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="请输入能力名称"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">能力分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CapabilityCategory })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.values(categoryMap).map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">能力归属/单位</label>
            <input
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="如：集团数智事业部、湖北、成都产业研究院"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="请描述该能力的功能和用途"
            />
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">详细信息</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">子产品</label>
                <textarea
                  value={formData.subProducts}
                  onChange={(e) => setFormData({ ...formData, subProducts: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="子产品列表"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">赋能场景</label>
                <textarea
                  value={formData.empoweredScenarios}
                  onChange={(e) => setFormData({ ...formData, empoweredScenarios: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="赋能场景描述"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">赋能行业（多选）</label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <button
                    key={industry.key}
                    type="button"
                    onClick={() => handleIndustryToggle(industry.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.empoweredIndustries.includes(industry.key)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {industry.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">合作单位</label>
                <textarea
                  value={formData.partners}
                  onChange={(e) => setFormData({ ...formData, partners: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="合作单位列表"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">产品定位</label>
                <input
                  type="text"
                  value={formData.productPosition}
                  onChange={(e) => setFormData({ ...formData, productPosition: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="如：外售、自用"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">联系人信息</label>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  添加联系人
                </button>
              </div>
              <div className="space-y-3">
                {formData.contacts.map((contact, index) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">联系人 {index + 1}</span>
                      {formData.contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(contact.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">单位</label>
                        <input
                          type="text"
                          value={contact.unit}
                          onChange={(e) => updateContact(contact.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="单位名称"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">姓名 *</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="联系人姓名"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">电话</label>
                        <input
                          type="text"
                          value={contact.phone}
                          onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="联系电话"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">邮箱</label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="邮箱地址"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">优惠政策</label>
                <input
                  type="text"
                  value={formData.preferentialPolicy}
                  onChange={(e) => setFormData({ ...formData, preferentialPolicy: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="优惠政策说明"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">产品经理</label>
                <input
                  type="text"
                  value={formData.productManager}
                  onChange={(e) => setFormData({ ...formData, productManager: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="产品经理姓名"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">能否二开</label>
                <select
                  value={formData.customizable}
                  onChange={(e) => setFormData({ ...formData, customizable: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">请选择</option>
                  <option value="是">是</option>
                  <option value="否">否</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="备注信息"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {editData ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
