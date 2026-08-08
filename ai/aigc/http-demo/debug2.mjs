import 'dotenv/config'
import pkg from '@zilliz/milvus2-sdk-node'
const { MilvusClient, MetricType } = pkg

const c = new MilvusClient({
  address: process.env.MILVUS_ADDRESS,
  token: process.env.MILVUS_TOKEN,
})

async function main() {
  await c.connect()
  await c.loadCollection({ collection_name: 'ebook2' })
  
  // Test with output_fields (like server does)
  const r1 = await c.search({
    collection_name: 'ebook2',
    vectors: [new Array(1024).fill(0.01)],
    limit: 3,
    metric_type: MetricType.COSINE,
    output_fields: ['id', 'content', 'chapter_num'],
  })
  console.log('With output_fields:')
  r1.results.forEach(i => {
    console.log('  id:', i.id, 'content_len:', i.content.length)
  })
  
  // Test WITHOUT output_fields
  const r2 = await c.search({
    collection_name: 'ebook2',
    vectors: [new Array(1024).fill(0.01)],
    limit: 3,
    metric_type: MetricType.COSINE,
  })
  console.log('\nWithout output_fields:')
  r2.results.forEach(i => {
    console.log('  id:', i.id, 'content_len:', i.content.length)
    console.log('  preview:', i.content.substring(0, 80))
  })
  
  process.exit(0)
}
main().catch(console.error)
