import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { RedisModule } from 'src/common/redis.module';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services/index';
import { LoginsEntity } from './entities/logins.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session-serializer';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { AuthTwilioService } from './services/auth.twilio.service';
import { TestController } from './test.controller';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, LoginsEntity]),
    RedisModule,
    ConfigModule,
    EmailModule,
    DataAccessModule,
  ],
  controllers: [AuthController, TestController],
  providers: [
    AuthService,
    AuthUserService,
    AuthPasswordService,
    AuthSignInService,
    AuthSessionService,
    AuthTwilioService,
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthUserService, AuthPasswordService, AuthSignInService, AuthService],
})
export class AuthModule {}
