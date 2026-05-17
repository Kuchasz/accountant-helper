import 'reflect-metadata';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

@Entity('jpk_vat_declaration_statuses')
@Index(['companyId', 'sentMonth'], { unique: true })
export class JpkVatDeclarationStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int', { name: 'company_id' })
  companyId!: number;

  @Column('text', { name: 'company_name' })
  companyName!: string;

  @Column('text', { name: 'database_name' })
  databaseName!: string;

  @Column('text', { name: 'server_name', nullable: true })
  serverName?: string | null;

  @Column('text', { name: 'sent_month' })
  sentMonth!: string;

  @Column('boolean', { name: 'has_sent' })
  hasSent!: boolean;

  @Column('int', { name: 'jpk_file_id', nullable: true })
  jpkFileId?: number | null;

  @Column('int', { name: 'period_year', nullable: true })
  periodYear?: number | null;

  @Column('int', { name: 'period_month', nullable: true })
  periodMonth?: number | null;

  @Column('text', { name: 'jpk_type', nullable: true })
  jpkType?: string | null;

  @Column('int', { nullable: true })
  status?: number | null;

  @Column('int', { name: 'status_code', nullable: true })
  statusCode?: number | null;

  @Column('text', { name: 'status_description', nullable: true })
  statusDescription?: string | null;

  @Column('text', { name: 'reference_number', nullable: true })
  referenceNumber?: string | null;

  @Column('datetime', { name: 'sent_at', nullable: true })
  sentAt?: Date | null;

  @Column('datetime', { name: 'received_at', nullable: true })
  receivedAt?: Date | null;

  @Column('datetime', { name: 'checked_at' })
  checkedAt!: Date;

  @Column('text', { name: 'last_error', nullable: true })
  lastError?: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
