import 'reflect-metadata';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  name!: string;

  @Column('text', { unique: true })
  email!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  key!: string;

  @Column('text')
  value!: string;

  @Column('text', { nullable: true })
  description?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('sql_server_connections')
export class SqlServerConnection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  name!: string; // "optima" or "payer"

  @Column('text', { nullable: true })
  server?: string;

  @Column('text', { nullable: true })
  database?: string;

  @Column('text', { nullable: true })
  username?: string;

  @Column('text', { nullable: true })
  password?: string; // Should be encrypted in production

  @Column('int', { default: 1433 })
  port!: number;

  @Column('boolean', { default: true })
  encrypt!: boolean;

  @Column('boolean', { name: 'trust_server_certificate', default: false })
  trustServerCertificate!: boolean;

  @Column('boolean', { name: 'is_configured', default: false })
  isConfigured!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
