import { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useCapabilityStore } from '../store/capabilityStore';

export default function QAAssistant() {
  const { capabilities } = useCapabilityStore();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<{ type: 'user' | 'bot'; content: string }[]>([
    {
      type: 'bot',
      content: '您好！我是智能助手，我可以根据您的需求为您分析和推荐合适的能力方案。请告诉我您的需求，例如：\n\n- "我需要一个面向金融行业的AI解决方案"\n- "推荐一些医疗相关的能力"\n- "有哪些教育领域的AI能力？"\n- "请推荐适合党政行业的能力"',
    },
  ]);

  const analyzeQuestion = (q: string): string => {
    const lowerQ = q.toLowerCase();
    
    const industryKeywords: Record<string, string[]> = {
      '党政': ['党政', '政务', '党务', '政法', '司法', '公安', '行政', '综治'],
      '金融': ['金融', '银行', '保险', '证券', '理财', '支付'],
      '医疗': ['医疗', '医药', '健康', '医院', '医生', '看病'],
      '教育': ['教育', '培训', '学校', '学习', '学生', '课程'],
      '交通': ['交通', '物流', '运输', '轨道', '铁路', '公路'],
      '能源': ['能源', '电力', '煤炭', '水利', '发电'],
      '制造': ['制造', '工业', '生产', '工厂', '产线'],
      '农业': ['农业', '农村', '农民', '种植', '养殖'],
      '文旅': ['文旅', '旅游', '文化', '传媒', '娱乐'],
      '园区': ['园区', '企业', '商业', '办公'],
    };

    const matchedIndustries: string[] = [];
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(kw => lowerQ.includes(kw))) {
        matchedIndustries.push(industry);
      }
    }

    const capabilityKeywords: Record<string, string[]> = {
      'AI': ['ai', '人工智能', '大模型', '智能'],
      '大数据': ['大数据', '数据', '分析', '洞察'],
      '安全': ['安全', '监控', '防护', '预警'],
      '应急': ['应急', '救援', '灾害', '事故'],
      '视频': ['视频', '监控', '图像', '识别'],
      '语音': ['语音', '语音转写', '语音合成'],
      'OCR': ['ocr', '文字识别', '识别'],
    };

    const matchedCapabilities: string[] = [];
    for (const [cap, keywords] of Object.entries(capabilityKeywords)) {
      if (keywords.some(kw => lowerQ.includes(kw))) {
        matchedCapabilities.push(cap);
      }
    }

    let result = '';

    if (matchedIndustries.length > 0) {
      result += `根据您的需求，我为您分析了以下适合的行业方向：\n\n`;
      for (const industry of matchedIndustries) {
        const industryCaps = capabilities.filter(cap => 
          cap.empoweredIndustries.includes(industry) || cap.empoweredIndustries.includes('全行业')
        );
        const relevantCaps = industryCaps.slice(0, 5);
        
        result += `📌 ${industry}行业\n`;
        if (relevantCaps.length > 0) {
          result += `推荐能力：\n`;
          relevantCaps.forEach((cap, idx) => {
            result += `${idx + 1}. ${cap.name}\n`;
          });
          if (industryCaps.length > 5) {
            result += `... 共 ${industryCaps.length} 个相关能力\n`;
          }
        } else {
          result += `暂时没有直接匹配的能力，但可以查看全行业能力\n`;
        }
        result += '\n';
      }
    }

    if (matchedCapabilities.length > 0 && matchedIndustries.length === 0) {
      result += `根据您提到的技术能力关键词，以下是相关能力：\n\n`;
      for (const capType of matchedCapabilities) {
        const typeCaps = capabilities.filter(cap => 
          cap.name.toLowerCase().includes(capType.toLowerCase()) ||
          cap.description.toLowerCase().includes(capType.toLowerCase())
        ).slice(0, 5);
        
        result += `🔧 ${capType}相关能力\n`;
        typeCaps.forEach((cap, idx) => {
          result += `${idx + 1}. ${cap.name}\n`;
        });
        result += '\n';
      }
    }

    if (matchedIndustries.length === 0 && matchedCapabilities.length === 0) {
      result = `抱歉，我暂时没有理解您的需求。您可以尝试询问：\n\n- 特定行业的能力推荐（如金融、医疗、教育等）\n- 特定技术能力（如AI、大数据、安全等）\n- 具体的业务场景（如应急救援、智能巡检等）\n\n您也可以直接浏览页面上的能力列表，了解我们提供的所有能力。`;
    }

    return result;
  };

  const handleSubmit = () => {
    if (!question.trim()) return;

    setAnswers(prev => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);
    setQuestion('');

    setTimeout(() => {
      const answer = analyzeQuestion(question);
      setAnswers(prev => [...prev, { type: 'bot', content: answer }]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">智能方案助手</span>
          </div>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {answers.map((answer, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${answer.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[85%] ${
                  answer.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                <pre className="text-sm whitespace-pre-wrap">{answer.content}</pre>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="输入您的需求..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
