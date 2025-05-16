/* eslint-disable prettier/prettier */

import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePhysiotherapistDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsArray()
  @IsOptional()
  specialties?: string[];
}
