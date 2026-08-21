import jwt from 'jsonwebtoken';


export default [
  {
    url: '/api/login',
    method: 'post', 
    timeout: 2000,
    response: ({ body }) => {
      console.log(body);
      if (body.username !== 'admin' || body.password !== '123456') {
        return {
          code: -1,
          message: 'username or password 错误'
        }
      }
      // 服务器端 给用户颁发token 
      // user json 放入   J
      // Web  StateLess  W
      // Token 加密算法 颁发的令牌 加盐 秘密的key
      const token = jwt.sign(
        { 
          user: body.username,
          role: 'admin'
        },
        'secret819!$',
        {
          expiresIn: 86400
        }
      )
      return {
        code: 0,  // 未有错误
        user: {
          username: body.username
        },
        token: token
      }
    }
  }
]