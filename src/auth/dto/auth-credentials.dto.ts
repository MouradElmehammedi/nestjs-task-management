import { IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class AuthCredentialsDto {
    @IsString({ message: 'Username must be a string' })
    @MinLength(4, { message: 'Username must be at least 4 characters' })
    @MaxLength(20, { message: 'Username must be less than 20 characters' })
    username: string;

    @IsString({ message: 'Password must be a string' })
    @MinLength(4, { message: 'Password must be at least 4 characters' })
    @MaxLength(20, { message: 'Password must be less than 20 characters' })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, { message: 'Password must contain at least one uppercase, one lowercase, one number and one special character' })
    password: string;
}