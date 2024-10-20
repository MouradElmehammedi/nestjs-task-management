import { IsIn, IsOptional } from "class-validator";  
import { TaskStatus } from "../task-status.enum";

export class GetTasksFilterDto {
    @IsOptional()
    @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    status: TaskStatus;

    @IsOptional()
    search: string;
}