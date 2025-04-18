import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fields } from './fields.entity';

@Entity({ name: 'field_pricing' })
export class FieldPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Fields)
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  durationInMinutes: number;

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
}