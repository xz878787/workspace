import 'dotenv/config'
import pkg from '@zilliz/milvus2-sdk-node'
const { MilvusClient, MetricType } = pkg

const c = new MilvusClient({
  address: process.env.MILVUS_ADDRESS,
  token: process.env.MILVUS_TOKEN,
})

async function main() {
  await c.connect()
  console.log('connected')
  await c.loadCollection({ collection_name: 'ebook2' })
  
  // Get random vectors by searching with a zero vector
  const r = await c.search({
    collection_name: 'ebook2',
    vectors: [new Array(1024).fill(0.01)],
    limit: 5,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'content', 'chapter_num'],
  })
  
  r.results.forEach(i => {
    console.log('id:', i.id, 'chapter:', i.chapter_num, 'content_len:', i.content.length)
    console.log('  preview:', i.content.substring(0, 100))
    console.log()
  })
  
  process.exit(0)
}
main().catch(console.error)
