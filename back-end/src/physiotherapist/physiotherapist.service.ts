import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Physiotherapist } from 'src/entities/physiotherapist.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { IPhysiotherapist } from 'src/shared/physioterapist.interface';
import { comparePassword, hashPassword } from 'src/utils/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { IPhysiotherapistLogin } from 'src/shared/physiotherapistLogin.interface';
import { IResetPhysiotherapistPassword } from 'src/shared/physiotherapistResetPassword.interface';
import { IPhysiotherapistProfileUpdate } from 'src/shared/physiotherapistProfileUpdate.interface';
import { ObjectId } from 'mongodb';

@Injectable()
export class PhysiotherapistService {
  private issuer = 'login';
  private audience = 'physiotherapist';
  constructor(
    @InjectRepository(Physiotherapist)
    private readonly physiotherapistRepository: Repository<Physiotherapist>,

    private readonly jwtService: JwtService,
  ) {}

  createToken(user: Physiotherapist) {
    return {
      access_token: this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '3 days',
          subject: String(user._id),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(
        'Ocorreu um erro na autenticação. Tente mais tarde',
      );
    }
  }

  //Cadastro Fisioterapeuta
  async registerProfessional(body: IPhysiotherapist): Promise<Physiotherapist> {
    try {
      const {
        name,
        email,
        phone,
        description,
        password,
        crefito,
        specialties,
      } = body;

      const professionalAlreadyExists =
        await this.physiotherapistRepository.findOne({
          where: { email: email },
        });
      if (professionalAlreadyExists) {
        throw new ConflictException('Já existe um usuário com esse e-mail!!!');
      }

      const hashedPassword = await hashPassword(password);

      const newProfessional = this.physiotherapistRepository.create({
        name: name,
        email: email,
        phone: phone,
        description: description,
        password: hashedPassword,
        crefito: crefito,
        specialties: specialties,
      });

      return await this.physiotherapistRepository.save(newProfessional);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        throw new InternalServerErrorException(
          'Erro ao processar o banco de dados.',
        );
      }

      throw new InternalServerErrorException(
        'Erro interno no sistema. Por favor tente mais tarde.',
      );
    }
  }

  // Login Fisioterapeuta
  async loginphysiotherapist(body: IPhysiotherapistLogin) {
    try {
      const { email, password } = body;

      const physiotherapist = await this.physiotherapistRepository.findOne({
        where: { email: email },
      });

      if (!physiotherapist) {
        throw new NotFoundException('Usuário não econtrado!!!');
      }

      const isValidPassword = await comparePassword(
        password,
        physiotherapist.password,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException('Email e/ou senha inválidos!!!');
      }

      return this.createToken(physiotherapist);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro interno no sistema. Por favor, tente mais tarde!!!',
      );
    }
  }

  async forget(email: string) {
    try {
      const physioterapist = await this.physiotherapistRepository.findOne({
        where: { email: email },
      });
      if (!physioterapist) {
        throw new UnauthorizedException('Email inválido!!!');
      }

      //TO DO: Enviar E-mail

      return true;
    } catch (error) {
      throw new Error('Erro ao enviar e-mail');
    }
  }

  async reset(body: IResetPhysiotherapistPassword) {
    try {
      const id = 0;

      const result = await this.physiotherapistRepository
        .createQueryBuilder()
        .update(Physiotherapist)
        .set({ password: body.password })
        .where('id = :id', { id })
        .returning('*')
        .execute();

      const updatedUser = result.raw[0];

      if (!updatedUser) {
        throw new UnauthorizedException(
          'Usuário não encontrado ou não atualizado.',
        );
      }

      return this.createToken(updatedUser);
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente novamente mais tarde',
      );
    }
  }

  //--------------------------*--------------------//

  async getAllProfessionals() {
    try {
      const allProfessionals = await this.physiotherapistRepository.find({});

      const professionalsWithoutPassword = allProfessionals.map(
        ({ password, ...rest }) => rest,
      );

      return professionalsWithoutPassword;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente novamente mais tarde',
      );
    }
  }

  async updatePhysiotherapistProfile(
    id: number,
    body: IPhysiotherapistProfileUpdate,
  ) {
    try {
      const objectId = new ObjectId(id);
      const { name, email, profilePicture, description, phone, specialties } =
        body;

      const physioterapistExists = await this.physiotherapistRepository.findOne(
        {
          where: {
            _id: objectId,
          },
        },
      );
      if (!physioterapistExists) {
        throw new NotFoundException(
          'Profissional não encontrado. Ocorreu um erro, tente mais tarde',
        );
      }
      const updatedUser = this.physiotherapistRepository.create({
        name,
        email,
        profilePicture,
        description,
        phone,
        specialties,
      });

      await this.physiotherapistRepository.save(updatedUser);

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente mais tarde',
      );
    }
  }

  async deleteProfile(id: string) {
    try {
      const objectId = new ObjectId(id);
      const physioterapistProfile = this.physiotherapistRepository.findOne({
        where: {
          _id: objectId,
        },
      });

      if (!physioterapistProfile) {
        throw new NotFoundException(
          'Ocorreu um erro, perfil não econtrado!!!. Tente mais tarde',
        );
      }

      await this.physiotherapistRepository.delete(id);

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro interno do sistema. Por favor tente mais tarde',
      );
    }
  }
}
