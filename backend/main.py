from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import json
import datetime

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    messages: List[Dict]
    user_query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict]
    timestamp: str
    intent_type: str

def load_data():
    try:
        with open("../src/store/initialData.ts", "r", encoding="utf-8") as f:
            content = f.read()
            first_bracket = content.find("[")
            start = content.find("[", first_bracket + 1)
            end = content.rfind("]") + 1
            if start != -1 and end != -1:
                return json.loads(content[start:end])
            else:
                return []
    except Exception as e:
        print("Error loading data: %s" % e)
        return []

caps = load_data()

def search(q):
    q = q.lower()
    results = []
    for cap in caps:
        score = 0
        fields = []
        name = cap.get("name", "")
        if q in name.lower():
            score += 3
            fields.append("name")
        desc = cap.get("description", "")
        if q in desc.lower():
            score += 2
            fields.append("desc")
        tech = cap.get("techStack", "")
        if q in tech.lower():
            score += 1
            fields.append("tech")
        inds = cap.get("empoweredIndustries", [])
        if isinstance(inds, list):
            for ind in inds:
                ind_lower = ind.lower()
                if q in ind_lower:
                    score += 2
                    fields.append("industry")
                else:
                    parts = ind_lower.split('、')
                    for part in parts:
                        if q in part:
                            score += 2
                            fields.append("industry")
                            break
        scenario = cap.get("empoweredScenarios", "")
        if scenario and q in scenario.lower():
            score += 2
            fields.append("scenario")
        if score > 0:
            results.append({"score": score, "fields": fields, "cap": cap})
    results.sort(key=lambda x: -x["score"])
    return results[:5]

def analyze_intent(q):
    q = q.lower()
    intents = {
        "事实查询": ["是什么", "有哪些", "什么是", "包含", "包括"],
        "解释说明": ["解释", "说明", "如何", "怎么", "为什么"],
        "推荐建议": ["推荐", "建议", "适合", "选择"],
        "能力查询": ["能力", "功能", "产品", "解决方案"]
    }
    for name, keywords in intents.items():
        for k in keywords:
            if k in q:
                return name
    return "事实查询"

def generate_answer(query, docs):
    if not docs:
        return "抱歉，未找到相关信息，请尝试其他关键词。"
    res = "根据知识库，为您找到以下信息：\n\n"
    for i, doc in enumerate(docs, 1):
        cap = doc["cap"]
        res += "【%d】%s\n" % (i, cap["name"])
        desc = cap.get("description", "")
        if desc and desc != "nan":
            res += "描述：%s\n" % desc
        inds = cap.get("empoweredIndustries", [])
        if isinstance(inds, list) and inds:
            res += "赋能行业：%s\n" % " ".join(inds)
        res += "\n"
    return res

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        q = req.user_query
        docs = search(q)
        sources = []
        for d in docs:
            cat = "集团能力" if d["cap"]["category"] == "group" else "省内能力"
            sources.append({"title": d["cap"]["name"], "category": cat, "fields": " ".join(d["fields"])})
        return ChatResponse(
            answer=generate_answer(q, docs),
            sources=sources,
            timestamp=str(datetime.datetime.now()),
            intent_type=analyze_intent(q)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status": "healthy", "count": len(caps)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
