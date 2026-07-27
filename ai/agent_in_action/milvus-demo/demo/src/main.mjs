import {
    // client 连接zilliz server 
    MilvusClient,
    // 索引的类型
    // Milvus 存的是高维向量，
    // 没有索引时，， 每次查询都要把库里的向量和查询向量逐一算相似度 (O(n)),
    // 数据量大了慢的没法用
    // 字典 拼音， 偏旁的索引， 迅速减少查询范围
    // 图书馆，找一本三体 没有索引，每本都要翻一下。
    // 小说/ 科幻 /文学馆
    // IVF_FLAT 聚簇索引
    IndexType,
    MetricType
} from '@zilliz/milvus2-sdk-node'
import 'dotenv/config'
// 云端地址
const ADDRESS = process.env.MILVUS_ADDRESS;
// api key
const TOKEN = process.env.MILVUS_TOKEN;

async function main() {
    const client = new MilvusClient({
        address: ADDRESS,
        token: TOKEN
    });
    console.log('正在连接 zilliz cloud....')

    const checkHealth = await client.checkHealth();
    if (!checkHealth.isHealthy) {
        console.error('连接失败', checkHealth.reasons);
        return;
    }
    console.log('链接成功， 集群状态正常。')

    // mysql table 集合
    const COLLECTION_NAME = 'test';
    const DIMENSION = 4;//维度

    try {
        await client.createCollection({
            collection_name: COLLECTION_NAME,
            dimension: DIMENSION,
            auto_id: true,// 自动生成id
        });
        console.log('创建集合成功');
        // 创建索引 让查询更快 
        await client.createIndex({
            collection_name: COLLECTION_NAME,
            field_name: 'vector',// 给某字段建索引
            index_type: IndexType.AUTOINDEX,
            metric_type: MetricType.COSINE
        });
        console.log('创建索引成功');

        const data = [
            //rows fields
            //相比于mysql 宽松一些， 可以再插入一些
            { vector: [0.1, 0.2, 0.3, 0.4], content: '这是第一条数据' },
            { vector: [0.5, 0.6, 0.7, 0.8], content: '这是第二条数据' },
        ]
        const insertRes = await client.insert({
            collection_name: COLLECTION_NAME,
            data: data// 太简单了 json  不用写sql
        })
        console.log('插入数据成功', insertRes.IDs);
        const searchRes = await client.search({
            collection_name: COLLECTION_NAME,
            data: [[0.5, 0.5, 0.6, 0.8]],
            limit: 2,
            output_fileds: ['content']
        })
        console.log('搜索结果', JSON.stringify(searchRes.results, null, 2));

    } catch (err) {
        console.error('创建索引失败', err.message);
    }

}
main()
    .catch(console.error)