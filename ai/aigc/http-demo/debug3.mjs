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
  
  // Count records
  const stats = await c.describeCollection({ collection_name: 'ebook2' })
  console.log('Collection stats:', JSON.stringify(stats, null, 2))
  
  // Query without filter to see what's there
  const r = await c.query({
    collection_name: 'ebook2',
    output_fields: ['id', 'content', 'chapter_num'],
    limit: 10,
  })
  console.log('\nFirst 10 records:')
  const results = r.results || r.data || []
  results.forEach(i => {
    console.log('  id:', i.id, 'chapter:', i.chapter_num, 'content_len:', i.content?.length)
    console.log('  preview:', (i.content || '').substring(0, 60))
    console.log()
  })
  
  process.exit(0)
}
main().catch(console.error)
