import pandas as pd
import json
import re
import uuid

df = pd.read_excel('/Users/cyt/Documents/trae_projects/capability/AI自有能力.xlsx', engine='openpyxl')

capabilities = []

INDUSTRY_KEYWORDS = {
    '通用': [
        '大模型', '通用大模型', '基础大模型', '行业大模型', '视觉大模型', '语音大模型', '多模态大模型',
        '九天大模型', '盘古大模型', '磐基', 'PaaS', '磐维数据库', '数据库', '云底座', '云平台',
        '云原生', '容器', '微服务', 'DevOps', '大数据平台', '数据治理', '数据中台', '数据要素',
        '区块链', '中移链', '物联网平台', 'AI平台', '人工智能平台', '能力开放平台', '通用能力',
        '基础平台', '技术中台', '算力平台', '训推平台', '模型平台', '智能体平台', 'Agent平台',
        '移动办公', '办公平台', '即时通讯', '统一认证', '用户中心', '能力中心', '开放平台',
        '数字孪生平台', 'GIS平台', '地图平台', '位置服务', '消息平台', '短信平台',
        '语音识别', '语音合成', 'OCR', '人脸识别', '活体检测', '自然语言处理', 'NLP',
        '通用人工智能', 'AIGC', 'AI生成', '文生文', '文生图', '文生视频', '数字人',
        '数据集', '高质量数据集', '训练数据', 'AI基础设施', '智算中心'
    ],
    '党政': [
        '党政', '政务', '党务', '政法', '司法', '公安', '警察', '警务', '行政执法', '综治', '城管',
        '政务服务', '行政审批', '税务', '财政', '工商', '民政', '人社', '社保', '医保',
        '应急', '消防', '安监', '信访', '统战', '宣传', '组织部', '纪委', '监委', '检察院',
        '法院', '审判', '监狱', '戒毒', '智慧城市', '数字政府', '政务云', '一网通办', '党建',
        '基层治理', '网格', '社区治理', '政务公开', '舆情', '意识形态', '纪检', '巡察',
        '政务短信', '政务热线', '12345', '市长热线', '电子政务', '政务外网', '政务内网'
    ],
    '金融': [
        '金融', '银行', '保险', '证券', '基金', '期货', '信托', '信贷', '风控', '反欺诈',
        '支付清算', '征信', '理财', '信用卡', '贷款', '存款', '汇款', '外汇', '贵金属',
        '投行', '券商', '理赔', '核保', '保单', '银保监', '证监会', '金融科技',
        '数字人民币', '移动支付', '智能投顾', '反洗钱', '普惠金融', '供应链金融',
        '消费金融', '银行核心', '金融云', '手机银行', '网上银行', '信贷审批'
    ],
    '医疗': [
        '医疗', '医药', '医院', '医生', '护士', '病患', '门诊', '住院', '手术',
        '药品', '器械', '诊断', '治疗', '影像', '检验', '体检', '疾控', '防疫',
        '疫情', '公共卫生', '药店', '诊所', '中医', '西医', '专科',
        '电子病历', 'EMR', 'HIS', 'PACS', 'LIS', '远程医疗', '互联网医院', '智慧医疗',
        '养老', '康养', '护理', '康复', '妇幼', '儿科', '妇产', '肿瘤', '心血管',
        '核酸', '疫苗', '发热门诊', '急诊', 'ICU', '病床', '挂号', '检查报告',
        '医保结算', '智慧医院', '远程会诊'
    ],
    '教育': [
        '教育', '学校', '学生', '教师', '教学', '课程', '课堂', '考试',
        '招生', '毕业', '学历', '学位', '校园', '高校', '大学', '中学', '小学', '幼儿园',
        '职教', '高职', '中职', '继续教育', '在线教育', '网课', 'MOOC', '智慧校园',
        '教务系统', '学工系统', '图书馆', '实验室', '科研管理', '论文', '答辩', '就业',
        '校企合作', '5G教育', '教育云', '双师课堂', '同步课堂', '教育资源', '在线考试'
    ],
    '交通': [
        '交通', '物流', '公路', '铁路', '高铁', '地铁', '机场', '航空', '港口',
        '码头', '航运', '水运', '高速', '收费站', '客运', '货运', '公交', '出租',
        '网约车', '停车', '违章', '驾照', '车辆识别', '车牌识别', 'ETC', '车联网',
        '自动驾驶', '无人驾驶', '智慧交通', '交通枢纽', '物流园', '仓储配送', '快递',
        '邮政', '供应链', '车辆调度', '导航', '路况', '信号灯', '交通违法', '港区',
        '智慧高速', '智慧港口', '智慧机场', '智慧地铁', '智能网联汽车'
    ],
    '能源': [
        '能源', '电力', '电网', '煤炭', '煤矿', '石油', '石化', '天然气', '油气',
        '水利', '水电', '风电', '光伏', '太阳能', '核电', '新能源', '充电站', '充电桩',
        '储能', '发电', '输电', '变电', '配电', '用电', '电费', '电表', '电力调度',
        '智慧能源', '能源互联网', '双碳', '碳达峰', '碳中和', '节能减排', '环保监测',
        '油田', '炼油', '燃气', '矿山', '矿井', '采矿', '选矿', '尾矿', '大坝监测',
        '智慧矿山', '智慧电厂', '智能电网', '电力巡检'
    ],
    '制造': [
        '制造', '工厂', '车间', '生产线', '流水线', '机床', '工业机器人',
        '智能制造', '工业互联网', '工业4.0', '数字化车间', '智能工厂',
        'MES系统', 'ERP系统', 'PLM系统', 'SCADA', 'DCS系统', 'PLC', '质检', '缺陷检测',
        '预测性维护', '设备管理', '工业视觉', '数字孪生', '5G+工业', 'AGV小车',
        '汽车制造', '电子制造', '半导体', '芯片', '集成电路', '3C制造', '家电制造',
        '钢铁冶金', '有色金属', '建材生产', '纺织服装', '食品加工', '烟草制造',
        '轮胎生产', '产线智能化', '工业质检', '智能焊接', '智能装配'
    ],
    '农业': [
        '农业', '农村', '农民', '农户', '种植', '养殖', '畜牧', '渔业', '水产', '农田',
        '耕地', '作物', '粮食', '蔬菜', '水果', '花卉', '苗木', '农药', '化肥',
        '种子', '农机', '灌溉', '气象监测', '病虫害', '扶贫', '乡村振兴',
        '智慧农业', '数字乡村', '农产品溯源', '冷链物流', '大棚种植', '温室',
        '果园', '茶园', '5G+农业', '农业物联网', '土壤墒情', '苗情监测',
        '生猪养殖', '牛羊养殖', '水产养殖'
    ],
    '文旅': [
        '文旅', '旅游', '文化', '传媒', '景区', '景点', '游客', '酒店', '民宿', '旅行社',
        '导游', '门票', '度假', '休闲娱乐', '演出', '展览', '博物馆', '图书馆', '文化馆',
        '文创', '影视', '电影', '电视', '广播', '出版', '报业', '新媒体', '融媒体',
        '短视频', '直播', '电竞', '游戏', '动漫', '体育赛事', '健身',
        '智慧旅游', '智慧景区', '全域旅游', '文旅云', '5G+文旅', 'VR/AR旅游',
        '智慧文博', '智慧广电'
    ],
    '园区': [
        '园区', '产业园', '工业园', '开发区', '高新区', '经开区', '孵化器', '众创空间',
        '智慧园区', '智慧楼宇', '楼宇经济', '总部经济', '招商引资', '营商环境',
        '产业集群', '园区管理', '企业服务'
    ],
}

def get_val(row, col_idx):
    val = row[df.columns[col_idx]]
    return str(val).strip() if not pd.isna(val) else ''

def classify_industries(text: str) -> list:
    matched = set()
    
    general_keywords = INDUSTRY_KEYWORDS['通用']
    is_general = False
    for keyword in general_keywords:
        if keyword in text:
            is_general = True
            break
    
    if is_general:
        return ['通用']
    
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        if industry == '通用':
            continue
        for keyword in keywords:
            if keyword in text:
                matched.add(industry)
                break
    
    if not matched:
        return ['通用']
    return list(matched)

def parse_list(val):
    if pd.isna(val):
        return []
    s = str(val).strip()
    if s == '' or s == 'nan':
        return []
    items = re.split(r'[\n、;；]+', s)
    return [item.strip().rstrip('；;，,') for item in items if item.strip()]

def parse_contacts(contact_str, phone_str, email_str, default_unit):
    contact_items = parse_list(contact_str)
    phone_items = parse_list(phone_str)
    email_items = parse_list(email_str)
    
    contacts = []
    max_len = max(len(contact_items), len(phone_items), len(email_items))
    
    for i in range(max_len):
        name_part = contact_items[i] if i < len(contact_items) else ''
        phone = phone_items[i] if i < len(phone_items) else ''
        email = email_items[i] if i < len(email_items) else ''
        
        unit = default_unit
        name = name_part
        
        if '：' in name_part:
            parts = name_part.split('：', 1)
            unit = parts[0].strip()
            name = parts[1].strip()
        elif ':' in name_part:
            parts = name_part.split(':', 1)
            unit = parts[0].strip()
            name = parts[1].strip()
        
        if name or phone or email:
            contacts.append({
                'id': str(uuid.uuid4())[:8],
                'unit': unit,
                'name': name,
                'phone': phone,
                'email': email,
            })
    
    return contacts

for i, row in df.iterrows():
    category = row[df.columns[0]]
    if pd.isna(category):
        continue
    
    name = row[df.columns[4]]
    if pd.isna(name):
        continue
    
    name_str = str(name).strip().replace('\n', '').replace('\r', '')
    if '产品/能力名称' in name_str or name_str == 'nan':
        continue
    
    cat_key = 'group' if '集团能力' in str(category) else 'province'
    
    default_unit = get_val(row, 3)
    sub_products = get_val(row, 5)
    description = get_val(row, 6)
    empowered_scenarios = get_val(row, 8)
    partners = get_val(row, 9)
    remarks = get_val(row, 17)
    
    all_text = ' '.join([
        name_str, description, sub_products, empowered_scenarios,
        partners, remarks, default_unit
    ])
    
    industries = classify_industries(all_text)
    
    contacts = parse_contacts(
        row[df.columns[10]],
        row[df.columns[11]],
        row[df.columns[12]],
        default_unit
    )
    
    cap = {
        'id': f'{i+1}',
        'name': name_str,
        'category': cat_key,
        'description': description,
        'status': 'online',
        'techStack': default_unit,
        'schemeMaterials': [],
        'createdAt': '2024-01-01',
        'updatedAt': '2024-01-01',
        'subProducts': sub_products,
        'empoweredIndustries': industries,
        'empoweredScenarios': empowered_scenarios,
        'partners': partners,
        'contacts': contacts,
        'preferentialPolicy': get_val(row, 13),
        'productPosition': get_val(row, 15),
        'customizable': get_val(row, 16),
        'remarks': remarks,
        'productManager': get_val(row, 18),
    }
    capabilities.append(cap)

print(f'Total capabilities: {len(capabilities)}')
print(f'Group: {len([c for c in capabilities if c["category"] == "group"])}')
print(f'Province: {len([c for c in capabilities if c["category"] == "province"])}')
print(f'Total contacts: {sum(len(c["contacts"]) for c in capabilities)}')

industry_counts = {}
for c in capabilities:
    for ind in c['empoweredIndustries']:
        industry_counts[ind] = industry_counts.get(ind, 0) + 1

print('\n=== 行业分类统计 ===')
for ind, count in sorted(industry_counts.items(), key=lambda x: -x[1]):
    print(f'{ind}: {count}个能力')

print('\n=== 多行业匹配示例 ===')
multi_industry = [c for c in capabilities if len(c['empoweredIndustries']) > 1]
for c in multi_industry[:5]:
    print(f'\n{c["name"]}:')
    print(f'  行业: {", ".join(c["empoweredIndustries"])}')

print('\n=== 通用行业能力示例 ===')
general_industry = [c for c in capabilities if c['empoweredIndustries'] == ['通用']]
for c in general_industry[:5]:
    print(f'- {c["name"]}')

with open('/Users/cyt/Documents/trae_projects/capability/src/store/initialData.ts', 'w', encoding='utf-8') as f:
    f.write("import type { Capability } from '../types';\n")
    f.write('export const initialData: Capability[] = ')
    f.write(json.dumps(capabilities, ensure_ascii=False))
    f.write(';\n')

print('\nFile written successfully!')
