// ES CURD 
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200'
})

const INDEX_NAME = 'travel_journal';
 
async function createDocument(){
    const res = await client.index({
        document:{
            
        }
    })
}