import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>, private jwtService: JwtService) 
    {}

    async register(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, password } = authCredentialsDto;
 
        const user = new User();
        user.username = username;
        user.salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, user.salt);

        try {
            return await this.userRepository.save(user);    
        } catch (error) {
            if (error.code === '23505') {
                this.logger.error('Username already exists');
                throw new ConflictException('Username already exists');
            } else {
                this.logger.error(JSON.stringify(error));
                throw new InternalServerErrorException();
            }
        }
    }

    async login(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const username = await this.validateUserPassword(authCredentialsDto);
        if (!username) {
            this.logger.error("Invalid credentials");
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload: JwtPayload = { username };
        const accessToken = await this.jwtService.sign(payload);

        this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);
        return { accessToken };
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const { username, password } = authCredentialsDto;
        const user = await this.userRepository.findOneBy({ username });

        if (user && await user.validatePassword(password)) {
            return user.username;
        } else {
            return null;
        }   
    }
}
