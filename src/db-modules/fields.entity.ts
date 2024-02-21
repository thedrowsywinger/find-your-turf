import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brands } from './brands.entity';
import { v4 } from 'uuid';

@Entity({ name: 'fields' })
export class Fields {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 255 })
  city: string;

  @Column({ length: 255 })
  country: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Brands)
  @JoinColumn({ name: 'brandId' })
  brandId: Brands;

  @Column({ default: 1 })
  status: number;

  @Column()
  createdBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
