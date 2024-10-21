import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { AuthService } from './auth.service'; 

@Controller('auth')
export class AuthController {

    constructor( private authService: AuthService) {}

    @Post('/register')
    register(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<User> {
        return this.authService.register(authCredentialsDto);
    }

    @Post('/login')
    login(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        return this.authService.login(authCredentialsDto);
    }
}
