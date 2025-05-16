import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Physiotherapist } from './entities/physiotherapist.entity';
import { PhysiotherapistModule } from './physiotherapist/physiotherapist.module';

@Module({
  imports: [
    PhysiotherapistModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URL,
      database: process.env.DB_NAME,
      entities: [Physiotherapist],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
