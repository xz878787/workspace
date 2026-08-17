import { Module } from '@nestjs/common';
// 控制器  检测前端用户输入， 一些控制逻辑
import { AppController } from './app.controller';
//数据库业务， 一些复杂业务  CRUD service 层
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
//
@Module({
  imports: [TodosModule],// 依赖外界？
  controllers: [AppController],// 控制器 校验
  providers: [AppService],
})
export class AppModule {}
