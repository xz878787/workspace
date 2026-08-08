import 'dotenv/config'
import pkg from '@zilliz/milvus2-sdk-node'
const { MilvusClient, DataType, MetricType, IndexType } = pkg

const c = new MilvusClient({
  address: process.env.MILVUS_ADDRESS,
  token: process.env.MILVUS_TOKEN,
})

async function main() {
  await c.connect()
  
  const COLLECTION_NAME = 'ebook2'
  
  // Try to drop multiple times to ensure it's gone
  for (let i = 0; i < 3; i++) {
    try {
      await c.dropCollection({ collection_name: COLLECTION_NAME })
      console.log(`Drop attempt ${i + 1} succeeded`)
    } catch(e) {
      console.log(`Drop attempt ${i + 1} failed:`, e.message)
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Check if it's gone
  try {
    await c.describeCollection({ collection_name: COLLECTION_NAME })
    console.log('Collection still exists!')
  } catch(e) {
    console.log('Collection fully deleted')
  }
  
  process.exit(0)
}
main().catch(console.error)
