import React from "react";
import { FileText, MoreHorizontal, Trash2, Edit3, Plus, ChevronDown, ChevronUp, User, Phone, Mail } from "lucide-react";
import type { Capability, SchemeMaterial, ContactPerson } from "../types";
import { categoryMap, materialTypeMap } from "../types";

interface CapabilityCardProps {
  capability: Capability;
  onEdit: () => void;
  onDelete: () => void;
  onAddMaterial: () => void;
  onDeleteMaterial: (materialId: string) => void;
}

export default function CapabilityCard({
  capability,
  onEdit,
  onDelete,
  onAddMaterial,
  onDeleteMaterial,
}: CapabilityCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const getMaterialIcon = (type: SchemeMaterial["type"]) => {
    switch (type) {
      case "doc": return "text-blue-500";
      case "pdf": return "text-red-500";
      case "ppt": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const industries = Array.isArray(capability.empoweredIndustries) 
    ? capability.empoweredIndustries.join(", ") 
    : capability.empoweredIndustries;
  
  const contacts: ContactPerson[] = Array.isArray(capability.contacts) ? capability.contacts : [];
  
  const detailFields = [
    { label: "子产品", value: capability.subProducts },
    { label: "赋能行业", value: industries },
    { label: "赋能场景", value: capability.empoweredScenarios },
    { label: "合作单位", value: capability.partners },
    { label: "优惠政策", value: capability.preferentialPolicy },
    { label: "产品定位", value: capability.productPosition },
    { label: "能否二开", value: capability.customizable },
    { label: "备注", value: capability.remarks },
    { label: "产品经理", value: capability.productManager },
  ].filter((f) => f.value && f.value !== "nan" && f.value !== "");

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${categoryMap[capability.category].color}`}>
              {categoryMap[capability.category].label}
            </span>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{capability.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{capability.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-50 px-2 py-1 rounded text-xs">能力归属</span>
          <span className="text-sm text-gray-600">{capability.techStack}</span>
        </div>

        {(detailFields.length > 0 || contacts.length > 0) && (
          <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-4 pb-2 border-b border-gray-100">
            <span>查看详细信息</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {showDetails && (
          <>
            {detailFields.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {detailFields.map((field, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-400 mr-2">{field.label}:</span>
                    <span className="text-gray-600 truncate">{field.value}</span>
                  </div>
                ))}
              </div>
            )}

            {contacts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">联系人信息</h4>
                <div className="space-y-2">
                  {contacts.map((contact, idx) => (
                    <div key={contact.id || idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {contact.unit && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{contact.unit}</span>}
                        <span className="text-sm font-medium text-gray-700">{contact.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 ml-6">
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                        )}
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">方案材料</h4>
            <button onClick={onAddMaterial} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>
          {capability.schemeMaterials.length > 0 ? (
            <div className="space-y-2">
              {capability.schemeMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${getMaterialIcon(material.type)}`} />
                    <div>
                      <span className="text-sm text-gray-700">{material.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{materialTypeMap[material.type]}</span>
                    </div>
                  </div>
                  <button onClick={() => onDeleteMaterial(material.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">暂无方案材料</p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>创建于 {capability.createdAt}</span>
          <span>更新于 {capability.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
