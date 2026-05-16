import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Comarch Optima database schema definitions
 * TypeORM entities for Optima tables.
 */

/**
 * CDN.Bazy - Database configurations table from config database
 * Contains information about available company databases
 */
@Entity({ schema: 'CDN', name: 'Bazy', synchronize: false })
export class CdnBazy {
  @PrimaryGeneratedColumn({ name: 'Baz_BazID' })
  id!: number;

  @Column('varchar', { name: 'Baz_Nazwa', length: 120 })
  name!: string;

  @Column('varchar', { name: 'Baz_Dostep', length: 254 })
  dostep!: string;

  @Column('smallint', { name: 'Baz_Nieaktywna' })
  nieaktywna!: number;

  @Column('nvarchar', { name: 'Baz_Opis', length: 254 })
  description!: string;

  @Column('datetime', { name: 'Baz_TS_Arch', nullable: true })
  tsArch?: Date;

  @Column('varchar', { name: 'Baz_NazwaArchiwum', length: 511 })
  nazwaArchiwum!: string;

  @Column('int', { name: 'Baz_CzasArchiwacji' })
  czasArchiwacji!: number;

  @Column('smallint', { name: 'Baz_OkresArchiwacji' })
  okresArchiwacji!: number;

  @Column('tinyint', { name: 'Baz_DostepnaWPM' })
  dostepnaWPM!: number;

  @Column('tinyint', { name: 'Baz_DostepnaWBIP' })
  dostepnaWBIP!: number;

  @Column('uniqueidentifier', { name: 'Baz_GUID' })
  guid!: string;

  // Computed column - extracted from Baz_Dostep
  @Column({ type: 'varchar', name: 'Baz_NazwaBazy', insert: false, update: false })
  databaseName!: string;

  // Computed column - extracted from Baz_Dostep
  @Column({ type: 'varchar', name: 'Baz_NazwaSerwera', insert: false, update: false })
  serverName!: string;

  @Column('decimal', { name: 'Baz_RozmiarBazy', precision: 8, scale: 2, nullable: true })
  rozmiarBazy?: number;

  @Column('decimal', { name: 'Baz_RozmiarDanychBin', precision: 8, scale: 2, nullable: true })
  rozmiarDanychBin?: number;

  @Column('tinyint', { name: 'Baz_AutomatycznyBackup' })
  automatycznyBackup!: number;

  @Column('tinyint', { name: 'Baz_DostepnaWPPK' })
  dostepnaWPPK!: number;

  @Column('varchar', { name: 'Baz_Nip', length: 24, nullable: true })
  nip?: string;

  @Column('smallint', { name: 'Baz_LimitRozmiaruDanychBinarnych' })
  limitRozmiaruDanychBinarnych!: number;

  // Helper property to check if database is active (inverse of Baz_Nieaktywna)
  get isActive(): boolean {
    return this.nieaktywna === 0;
  }
}
