import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fields } from './fields.entity';
import { v4 } from 'uuid';

@Entity({ name: 'offers' })
export class Offers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4()})
  code: string;

  @Column()
  rent: number;

  @Column()
  duration: number;

  @Column({ length: 255 })
  unit: string;

  @ManyToOne(() => Fields)
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @Column({ default: 1 })
  status: number;

  @Column()
  createdBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;
}
