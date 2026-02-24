import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { envConfig } from './config/env.config';
import databaseConfig from './config/database.config';
import { PrismaService } from './database/prisma.service';
import { UserModule } from './modules/users/user.module';

const projectRoot = path.resolve(__dirname, '..');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(projectRoot, '.env'), '.env'],
      load: [envConfig, databaseConfig],
    }),
    UserModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
