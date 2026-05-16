import 'reflect-metadata';
import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Comarch Optima database schema definitions
 * TypeORM entities for Optima tables.
 */

/**
 * CDN.BAZY - Database configurations table from config database
 * Contains information about available company databases
 */
@Entity({ name: 'CDN.BAZY', synchronize: false })
export class CdnBazy {
  @PrimaryColumn('int', { name: 'Baz_ID' })
  id!: number;

  @Column('varchar', { name: 'Baz_Nazwa', length: 255 })
  name!: string;

  @Column('varchar', { name: 'Baz_NazwaBazy', length: 255 })
  databaseName!: string;

  @Column('int', { name: 'Baz_Aktywna', default: 1 })
  isActive!: number;

  @Column('varchar', { name: 'Baz_Opis', length: 500, nullable: true })
  description?: string;

  @Column('varchar', { name: 'Baz_Serwer', length: 255, nullable: true })
  server?: string;
}
