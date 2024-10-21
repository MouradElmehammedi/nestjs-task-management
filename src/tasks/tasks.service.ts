import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-dto.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
    private logger = new Logger('TasksService');
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>) 
    {}

    async getTasks(
        filterDto: GetTasksFilterDto,
        user: User
    ): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.taskRepository.createQueryBuilder('task');

        query.where('task.userId = :userId', { userId: user.id });

        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }
        try {
            const tasks = await query.getMany();
            return tasks;
        } catch (error) {
            this.logger.error(`Failed to get tasks for user "${user.username}": ${JSON.stringify(error)}`, error.stack);
            throw new InternalServerErrorException();
        }
    }

    async getTaskById(
        id: number,
        user: User
    ): Promise<Task> {
        const found = await this.taskRepository.findOne({ where: { id, userId: user.id } });

        if (!found) {
            this.logger.error(`Failed to get task for user "${user.username}": Task with ID "${id}" not found.`);
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }

        return found;
    }

    async createTask(
        createTaskDto: CreateTaskDto,
        user: User
    ): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.user = user;
        
        try {
            await task.save();
        } catch (error) {
            this.logger.error(`Failed to create task for user "${user.username}": ${JSON.stringify(error)}`, error.stack);
            throw new InternalServerErrorException();
        }

        delete task.user;
        return task;
    }

    async deleteTask(
        id: number,
        user: User
    ): Promise<void> {
        const result = await this.taskRepository.delete({ id, userId: user.id });
        if (result.affected === 0) {
            this.logger.error(`Failed to delete task for user "${user.username}": Task with ID "${id}" not found.`);
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
    }

    async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);

        task.status = status;
         
        try {
            await task.save();
        } catch (error) {
            this.logger.error(`Failed to update task for user "${user.username}": ${JSON.stringify(error)}`, error.stack);
            throw new InternalServerErrorException();
        }

        return task;
    }



    // private tasks: Task[] = [];

    // getAllTasks(): Task[] {
    //     return this.tasks;
    // }

    // getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
    //     const { status, search } = filterDto;
    //     let tasks = this.getAllTasks();

    //     if (status) {   
    //         tasks = tasks.filter(task => task.status === status);
    //     }   

    //     if (search) {  
    //         tasks = tasks.filter(task => 
    //             task.title.includes(search) || 
    //             task.description.includes(search)
    //         );
    //     }

    //     return tasks;
    // }

    // getTaskById(id: string): Task {
    //     const foundTask = this.tasks.find(task => task.id === id);

    //     if (!foundTask) {
    //         throw new NotFoundException(`Task with ID "${id}" not found.`);
    //     }

    //     return foundTask
    // }

    // createTask(createTaskDto: CreateTaskDto): Task {
    //     const { title, description } = createTaskDto;
    //     const task: Task = {
    //         id: uuid.v4(),
    //         title: title,
    //         description: description,
    //         status: TaskStatus.OPEN
    //     }

    //     this.tasks.push(task);

    //     return task;
    // }

    // deleteTask(id: string): void {
    //     const foundTask = this.getTaskById(id);
    //     this.tasks = this.tasks.filter(task => task.id !== foundTask.id);
    // }

    // updateTaskStatus(id: string, status: TaskStatus): Task {
    //     const task = this.getTaskById(id);
    //     task.status = status;
    //     return task;
    // }
}
