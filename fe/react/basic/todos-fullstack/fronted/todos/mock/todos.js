export default {
  url: '/api/todos',
  method: 'GET',
  timeout: 1000,
  response:(req,res)=> {//请求对象，响应对象
   return {
    code:0,//成功，没问题
    todos:[{
        id:1,
        title:'学习前端接口工程',
        completed:true,
   }
    ,{
        id:2,
        title:'看龙餐厅',
        completed:false,
    }
]
   }
  },
};