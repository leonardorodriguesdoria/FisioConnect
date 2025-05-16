/* eslint-disable prettier/prettier */
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Physiotherapist {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column()
  crefito: string;

  @Column()
  description: string;

  @Column({ default: 'https://ibb.co/27mgpNMx' })
  profilePicture: string;

  @Column('simple-array')
  specialties: string[];
}
