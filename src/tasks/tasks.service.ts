import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-dto.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>) 
    {}

    async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.taskRepository.createQueryBuilder('task');

        if (status) {
            query.andWhere('task.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        const tasks = await query.getMany();
        return tasks;
    }

    async getTaskById(id: number): Promise<Task> {
        const found = await this.taskRepository.findOneBy({ id });

        if (!found) {
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }

        return found;
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = new Task();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        await task.save();
        return task;
    }

    async deleteTask(id: number): Promise<void> {
        const result = await this.taskRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
    }

    async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
        const task = await this.getTaskById(id);

        task.status = status;
        await task.save();

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
