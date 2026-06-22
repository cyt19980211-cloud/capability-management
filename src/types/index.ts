export type CapabilityCategory = 'group' | 'province';

export interface ContactPerson {
  id: string;
  unit: string;
  name: string;
  phone: string;
  email: string;
}

export interface Capability {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  status?: 'online';
  techStack: string;
  schemeMaterials: SchemeMaterial[];
  createdAt: string;
  updatedAt: string;
  
  subProducts: string;
  empoweredIndustries: string[];
  empoweredScenarios: string;
  partners: string;
  contacts: ContactPerson[];
  preferentialPolicy: string;
  productPosition: string;
  customizable: string;
  remarks: string;
  productManager: string;
}

export interface IndustryInfo {
  key: string;
  label: string;
}

export const industryGroups: Record<string, IndustryInfo> = {
  '党政': { key: '党政', label: '党政' },
  '政务': { key: '党政', label: '党政' },
  '党务': { key: '党政', label: '党政' },
  '政法': { key: '党政', label: '党政' },
  '司法': { key: '党政', label: '党政' },
  '公安': { key: '党政', label: '党政' },
  '行政执法': { key: '党政', label: '党政' },
  '综治': { key: '党政', label: '党政' },
  
  '金融': { key: '金融', label: '金融' },
  '银行': { key: '金融', label: '金融' },
  '保险': { key: '金融', label: '金融' },
  '证券': { key: '金融', label: '金融' },
  
  '医疗': { key: '医疗', label: '医疗' },
  '医药': { key: '医疗', label: '医疗' },
  '健康': { key: '医疗', label: '医疗' },
  
  '教育': { key: '教育', label: '教育' },
  '培训': { key: '教育', label: '教育' },
  
  '交通': { key: '交通', label: '交通' },
  '物流': { key: '交通', label: '交通' },
  '运输': { key: '交通', label: '交通' },
  
  '能源': { key: '能源', label: '能源' },
  '电力': { key: '能源', label: '能源' },
  '煤炭': { key: '能源', label: '能源' },
  '水利': { key: '能源', label: '能源' },
  
  '制造': { key: '制造', label: '制造' },
  '工业': { key: '制造', label: '制造' },
  '生产': { key: '制造', label: '制造' },
  
  '农业': { key: '农业', label: '农业' },
  '农村': { key: '农业', label: '农业' },
  
  '文旅': { key: '文旅', label: '文旅' },
  '旅游': { key: '文旅', label: '文旅' },
  '文化': { key: '文旅', label: '文旅' },
  '传媒': { key: '文旅', label: '文旅' },
  
  '园区': { key: '园区', label: '园区' },
  '企业': { key: '园区', label: '园区' },
  
  '通用': { key: '通用', label: '通用' },
  '全行业': { key: '通用', label: '通用' },
};

export const industryOptions: IndustryInfo[] = [
  { key: '党政', label: '党政' },
  { key: '金融', label: '金融' },
  { key: '医疗', label: '医疗' },
  { key: '教育', label: '教育' },
  { key: '交通', label: '交通' },
  { key: '能源', label: '能源' },
  { key: '制造', label: '制造' },
  { key: '农业', label: '农业' },
  { key: '文旅', label: '文旅' },
  { key: '园区', label: '园区' },
  { key: '通用', label: '通用' },
];

export function getIndustryGroup(industry: string): string {
  return industryGroups[industry]?.key || industry;
}

export interface SchemeMaterial {
  id: string;
  name: string;
  type: 'doc' | 'pdf' | 'ppt' | 'other';
  filePath: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface CategoryInfo {
  key: CapabilityCategory;
  label: string;
  color: string;
}

export const categoryMap: Record<CapabilityCategory, CategoryInfo> = {
  group: { key: 'group', label: '集团能力', color: 'bg-blue-500' },
  province: { key: 'province', label: '省内能力', color: 'bg-green-500' },
};

export const materialTypeMap: Record<SchemeMaterial['type'], string> = {
  doc: '文档',
  pdf: 'PDF',
  ppt: '演示文稿',
  other: '其他',
};
