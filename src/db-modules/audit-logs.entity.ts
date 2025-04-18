import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { Fields } from './fields.entity';
import { Brands } from './brands.entity';
import { v4 } from 'uuid';

export enum AuditActionType {
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  SCHEDULE_CREATED = 'schedule_created',
  SCHEDULE_UPDATED = 'schedule_updated',
  SCHEDULE_DELETED = 'schedule_deleted',
  PRICING_UPDATED = 'pricing_updated',
  STAFF_ADDED = 'staff_added',
  STAFF_UPDATED = 'staff_updated',
  STAFF_REMOVED = 'staff_removed',
  FACILITY_UPDATED = 'facility_updated',
  REVIEW_RESPONSE = 'review_response',
  MAINTENANCE_LOG = 'maintenance_log',
  CUSTOMER_SERVICE_ACTION = 'customer_service_action'
}

@Entity({ name: 'audit_logs' })
export class AuditLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @ManyToOne(() => Fields, { nullable: true })
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @ManyToOne(() => Brands, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brandId: Brands;

  @Column({
    type: 'enum',
    enum: AuditActionType
  })
  action: AuditActionType;

  @Column({ type: 'jsonb' })
  details: {
    previousState?: any;
    newState?: any;
    description?: string;
    metadata?: any;
  };

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ default: 1 })
  status: number;
}