import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { Fields } from './fields.entity';
import { v4 } from 'uuid';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity()
export class Bookings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @ManyToOne(() => Fields)
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('int')
  duration: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 1 })
  active: number;

  @Column()
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;
}