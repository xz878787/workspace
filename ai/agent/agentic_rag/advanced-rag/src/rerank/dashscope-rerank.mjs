import "dotenv/config";
import { 
  // 排序 + 压缩 
  BaseDocumentCompressor  // 基础类
} from '@langchain/core/retrievers/document_compressors';
// 基于阿里云 重排模型 
// 方便替换 
export class DashscopeRerank  extends BaseDocumentCompressor {
  constructor({ apiKey, model = process.env.RERANK_MODEL, topN = 3, baseUrl }) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.topN = topN;
    this.baseUrl = baseUrl ?? process.env.RERANK_URL;
  }
  async compressDocuments(documents, query, _callbacks) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          query,
          // langchain Document 
          documents: documents.map(d => d.pageContent)
        },
        parameters: {
          return_documents: false,
          top_n: this.topN
        }
      })
    });
    if (!res.ok) {
      // 此时 json 还未解析，用 text() 拿原始错误体，避免 ReferenceError 掩盖真实错误
      const errorText = await res.text().catch(() => "");
      throw new Error(`DashScope rerank ${res.status}:${errorText}`)
    }
    const json  = await res.json();
    const results = json?.output?.results;
    if (!Array.isArray(results)) {
      throw new Error(`unexpected rerank response ${JSON.stringify(results)}`)
    }
    console.log(results);
    return results.map(item => documents[item.index])

  }
}