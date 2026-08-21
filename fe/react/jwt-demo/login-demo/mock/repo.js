// repo 接口的 mock 数据
export default [
  {
    url: '/api/repo',
    method: 'get',
    timeout: 500,
    response: () => {
      // 模拟返回仓库列表数据
      return {
        code: 0,
        data: [
          { id: 1, name: 'todo-list', stars: 128 },
          { id: 2, name: 'nestjs-hello', stars: 256 },
          { id: 3, name: 'jwt-demo', stars: 64 }
        ]
      }
    }
  }
]
