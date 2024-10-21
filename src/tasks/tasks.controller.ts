import { Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service'; 
import { CreateTaskDto } from './dto/create-dto.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user-decorator';
import { User } from 'src/auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');

    constructor(private tasksService: TasksService) {}

    @Get()
    getTasks(
        @Query() filterDto: GetTasksFilterDto,
        @Req() req: any
    ): Promise<Task[]> {
        this.logger.verbose(`User ${req.user.username} retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
        return this.tasksService.getTasks(filterDto, req.user);
    }

    @Get('/:id')
    getTaskById(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any
    ): Promise<Task> {
        this.logger.verbose(`User ${req.user.username} retrieving task with ID ${id}.`);
        return this.tasksService.getTaskById(id, req.user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @Req() req: any
    ): Promise<Task> {
        this.logger.verbose(`User ${req.user.username} creating a new task. Data: ${JSON.stringify(createTaskDto)}`);
        return this.tasksService.createTask(createTaskDto, req.user);
    }

    @Delete('/:id')
    deleteTask(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any
    ): Promise<void> {
        return this.tasksService.deleteTask(id, req.user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number, 
        @Body('status', TaskStatusValidationPipe) newStatus: TaskStatus,
        @Req() req: any
    ): Promise<Task> {
        this.logger.verbose(`User ${req.user.username} updating task with ID ${id}. Status: ${newStatus}`);
        return this.tasksService.updateTaskStatus(id, newStatus, req.user);
    }

    // @Get()
    // getTasks(@Query() filterDto: GetTasksFilterDto): Task[] {
    //     if (Object.keys(filterDto).length) {
    //         return this.tasksService.getTasksWithFilters(filterDto);
    //     }
    //     return this.tasksService.getAllTasks();
    // }

    // @Get('/:id')
    // getTaskById(@Param('id') id: string): Task {
    //     return this.tasksService.getTaskById(id);
    // }

    // @Post()
    // @UsePipes(ValidationPipe)
    // createTask(@Body() createTaskDto: CreateTaskDto): Task {
    //     return this.tasksService.createTask(createTaskDto);
    // }

    // @Delete('/:id')
    // deleteTask(@Param('id') id: string): void {
    //     this.tasksService.deleteTask(id);
    // }

    // @Patch('/:id/status')
    // updateTaskStatus(@Param('id') id: string, @Body('status', TaskStatusValidationPipe) newStatus: TaskStatus): Task {
    //     return this.tasksService.updateTaskStatus(id, newStatus);
    // }
}
