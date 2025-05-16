import { Module } from '@nestjs/common';
import { PhysiotherapistService } from './physiotherapist.service';
import { PhysiotherapistController } from './physiotherapist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Physiotherapist } from 'src/entities/physiotherapist.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './profilePicturesUploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;

          callback(null, filename);
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Physiotherapist]),
  ],
  controllers: [PhysiotherapistController],
  providers: [PhysiotherapistService],
  exports: [PhysiotherapistService],
})
export class PhysiotherapistModule {}
