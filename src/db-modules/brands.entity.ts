import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { Fields } from './fields.entity';

@Entity({ name: 'brands' })
export class Brands {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 255, nullable: false })
  contactEmail: string;

  @Column({ length: 255, nullable: false })
  contactPhone: string;

  @Column({ length: 255, nullable: false })
  country: string;

  @Column({ length: 255, nullable: false })
  city: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 255, nullable: true })
  postalCode: string;

  @Column({ length: 255, nullable: false })
  fullAddress: string;

  @Column({ default: 1 })
  status: number;

  @Column()
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Fields, field => field.brand, { cascade: ['insert'] })
  fields: Fields[];

}
