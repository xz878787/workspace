// 相对脚本文件定位 .env（在上级目录），无论从哪个目录启动都能加载
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env")
});
import { Document } from '@langchain/core/documents';
import { DashscopeRerank } from "./dashscope-rerank.mjs";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const compressor = new DashscopeRerank({ apiKey, topN: 3 });
  const query = "什么是文本排序模型";
  const docs = [
    new Document({ pageContent: "预训练语言模型的发展给文本排序模型带来了新的进展"}),
    new Document({ pageContent: "量子计算是计算科学的一个前沿领域"}),
    new Document({ pageContent: "文本排序模型广泛用于搜索引擎和推荐系统中"}),
  ];
  const ranked = await compressor.compressDocuments(docs, query);
  console.log("重新排序好的", ranked);
}
main()
  .catch(console.error);