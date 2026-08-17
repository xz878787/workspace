import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // 给controller 层一个交代的
  getHello(): string {
    return 'Hello World!';
  }
}
