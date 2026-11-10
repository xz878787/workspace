import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';

// 登录结果
export interface LoginResult {
  accessToken: string; // 访问令牌
  refreshToken: string; // 刷新令牌
  tokenType: 'Bearer';
  expiresIn: number;
}

@Injectable()
export class AuthService {
  async login(dto: LoginDto) :Promise<LoginResult> {
    return {
      accessToken: '123456',
      refreshToken: '123456',
      tokenType: 'Bearer',
      expiresIn: 3600
    }
  }
}
