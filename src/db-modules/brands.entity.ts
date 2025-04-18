import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';

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
  fullAddress: string;

  @Column({ default: 1 })
  status: number;

  @Column()
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
