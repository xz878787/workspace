// import{
//     Get,
//     Controller
// } from '@nestjs/common';
// import { TodosService, Todo } from './todos.service';
// @Controller('todos')
// export class TodosController {
//     constructor(private readonly todosService: TodosService) {}
//     @Get()
//     findAll():Todo[]{
//         //  /todos
//         console.log('/todos controller');
//         // 怎么找到service ? import new 实例化
//         return this.todosService.findAll();
//     }
// }

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { type Todo } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}
  @Get()
  findAll(): Todo[] {
    // /todos
    console.log('/todos controller');
    // 怎么找到service? import  new 实例化 
    return this.todosService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string):Todo {
    console.log(id);
    return this.todosService.findOne(Number(id));
  }

  @Post()
  create(@Body('title') title: string):Todo {
    return this.todosService.create(title);
  }
}
//petch
// @Put(':id')
// update (
//     @Param('id') id: string,
//     @Body() todo: Todo,
//     @Body('complete') complete: boolean,
// )
