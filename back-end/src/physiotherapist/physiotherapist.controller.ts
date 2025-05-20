/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PhysiotherapistService } from './physiotherapist.service';
import { CreatePhysiotherapistDto } from './dto/create-physiotherapist.dto';
import { UpdatePhysiotherapistDto } from './dto/update-physiotherapist.dto';
import { LoginPhysiotherapistDto } from './dto/login-physiotherapist.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectId } from 'typeorm';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('physiotherapist')
export class PhysiotherapistController {
  constructor(
    private readonly physiotherapistService: PhysiotherapistService,
  ) {}

  @Get('list')
  async listAllProfessionals() {
    return await this.physiotherapistService.getAllProfessionals();
  }

  @Get(':id')
  async professionalProfile(@Param('id') id: string) {
    return await this.physiotherapistService.getProfessionalProfile(id);
  }

  @Post('register')
  async create(@Body() createPhysiotherapistDto: CreatePhysiotherapistDto) {
    const physioterapist =
      await this.physiotherapistService.registerProfessional(
        createPhysiotherapistDto,
      );
    return { message: 'Profissional cadastro com sucesso!!!', physioterapist };
  }

  @Post('login')
  async login(@Body() loginPhysiotherapistDto: LoginPhysiotherapistDto) {
    return await this.physiotherapistService.loginphysiotherapist(
      loginPhysiotherapistDto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Body() updateProfileDto: UpdatePhysiotherapistDto,
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (image) {
      updateProfileDto.profilePicture = image.path;
    }

    const updateProfile =
      await this.physiotherapistService.updatePhysiotherapistProfile(
        id,
        updateProfileDto,
      );

    return {
      message: 'Dados do perfil atualizados com sucesso!!!',
      updateProfile,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async removeProfile(@Param('id') id: string) {
    await this.physiotherapistService.deleteProfile(id);
    return { message: 'Sua conta foi excluída com sucesso!!!' };
  }
}
