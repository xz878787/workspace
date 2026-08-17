import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 实例化一个后端nest js 应用
  //面向对象思想
  //工厂模式
  // nest 可以卡法的后端服务太多了
  // / 首页 由 AppModule来服务
  // Module 是一个整体 后端最常见的MVC 模式
  // 一个文件 几千行代码，
  // localhost:3005/   /后端路由  -> 送到 AppModule
  // 组织控制器 controller 
  const app = await NestFactory.create(AppModule);
  // 启动web http 服务 3000
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
