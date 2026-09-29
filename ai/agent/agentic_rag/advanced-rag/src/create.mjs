// ES CURD 
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
})

const INDEX_NAME = 'travel_journal';

async function createIndex() {
  const exists = await client.indices.exists({
    index: INDEX_NAME
  });

  if (exists) {
    console.log(`索引已存在：${INDEX_NAME}`);
    return;
  }

  await client.indices.create({
    index: INDEX_NAME,
    mappings: {  // 结构
      properties: {
        note_title: { type: 'text', analyzer: 'ik_max_word',
          search_analyzer: 'ik_smart' },  // IK 插件只有 ik_smart / ik_max_word 两种
        note_body: { type: 'text', analyzer: 'ik_max_word',
          search_analyzer: 'ik_smart'},
        tags: { type: 'keyword' },
        mood: { type: 'keyword' },  // 和种子数据字段名保持一致（原来写的 mod）
        priority: { type: 'integer' },
        created_at: { type: 'date' },
        updated_at: { type: 'date' },
      }
    }
  });
  console.log(`索引创建成功：${INDEX_NAME}`);
}

async function seedData() {
const now = new Date().toISOString();
 const docs = [
    {
      note_title: '杭州西湖半日游',
      note_body: '早上绕湖慢跑，中午吃片儿川，下午在断桥拍照放松。',
      tags: ['旅行', '周末', '杭州'],
      mood: 'relaxed',
      priority: 2,
      created_at: now,
      updated_at: now
    },
    {
      note_title: '城市骑行计划',
      note_body: '周六沿江骑行 20 公里，带上水和简易修车工具。',
      tags: ['运动', '骑行'],
      mood: 'energetic',
      priority: 3,
      created_at: now,
      updated_at: now
    },
    {
      note_title: '雨天宅家阅读',
      note_body: '下雨天在家看书，整理本周笔记并做晚餐。',
      tags: ['生活', '阅读'],
      mood: 'calm',
      priority: 1,
      created_at: now,
      updated_at: now
    }
  ];
  const operations =
   docs.flatMap((doc)=>[{index:{_index: INDEX_NAME}},doc])  // bulk 操作头：{index: {_index: 索引名}}，原文档多嵌套了一层
// 批量插入
await client.bulk({
  operations,
  refresh: true,// 立即刷新索引
});
}

async function main() {
  await createIndex(); // 创建索引
  await seedData(); // 种子数据
}
main();