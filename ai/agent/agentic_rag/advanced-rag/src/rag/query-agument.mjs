import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as z from 'zod';

export const QueryAugmentSchema = z.object({
  queries: z.array(z.string()).length(3),
});

// LangChain 模板里要输出字面 { } 必须用双大括号 {{ }}
const AUGMENT_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `你是一个查询改写助手。请把用户的问题改写成恰好3条不同角度的检索问句，
每条都和原意一致但措辞/角度尽量不同；专有名词、型号、订单号必须原样保留。
只输出 JSON，格式严格为：
{{"queries": ["改写1", "改写2", "改写3"]}}
不要任何其他文字或代码块标记。`
  ],
  ["human", "{query}"]
]);

function normalizeThreeQueries(original, list) {
  const out = (list ?? [])
    .map((s) => (typeof s === "string") ? s.trim() : "")
    .filter(Boolean);
  while (out.length < 3) out.push(original);
  return out.slice(0, 3);
}

export async function augmentQuery(chatModel, query) {
  try {
    const chain = AUGMENT_PROMPT.pipe(chatModel);
    const msg = await chain.invoke({ query });
    const text = (msg.content ?? "").toString().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const raw = JSON.parse(cleaned);
    const parsed = QueryAugmentSchema.safeParse(raw);
    if (parsed.success) {
      return { queries: normalizeThreeQueries(query, parsed.data.queries) };
    }
    console.warn("Zod 校验失败，降级用原问题:", parsed.error?.message);
    return { queries: normalizeThreeQueries(query, []) };
  } catch (error) {
    console.warn("查询增强失败，降级用原问题:", error.message?.split('\n')[0]);
    return { queries: normalizeThreeQueries(query, []) };
  }
}

export function retrievalQueryString(original, augmentation) {
  return [original, ...(augmentation.queries ?? [])]
    .map(s => typeof s === "string" ? s.trim() : "")
    .filter(Boolean);
}
