import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fields } from './fields.entity';
import { v4 } from 'uuid';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

@Entity({ name: 'field_schedules' })
export class FieldSchedules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @ManyToOne(() => Fields)
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @Column({
    type: 'enum',
    enum: DayOfWeek
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  specialPrice: number;

  @Column({ nullable: true, length: 50 })
  zoneName: string;

  @Column({ type: 'json', nullable: true })
  zoneConfig: {
    capacity?: number;
    description?: string;
    amenities?: string[];
  };

  @Column({
    type: 'enum',
    enum: RecurrenceType,
    default: RecurrenceType.WEEKLY
  })
  recurrenceType: RecurrenceType;

  @Column({ type: 'json', nullable: true })
  recurrenceConfig: {
    interval?: number;
    daysOfWeek?: DayOfWeek[];
    monthlyDays?: number[];
    endDate?: Date;
    exceptions?: Date[];
  };

  @Column({ type: 'json', nullable: true })
  timeBlocks: {
    startTime: string;
    endTime: string;
    capacity?: number;
    price?: number;
  }[];

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