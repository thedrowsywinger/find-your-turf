import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  CONSUMER = 'consumer',
  FACILITY_MANAGER = 'facility_manager',
  MAINTENANCE_STAFF = 'maintenance_staff',
  CUSTOMER_SERVICE = 'customer_service'
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4() })
  code: string;

  @Column({ length: 255 })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER
  })
  role: UserRole;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    canManageStaff?: boolean;
    canManageBookings?: boolean;
    canUpdateSchedules?: boolean;
    canRespondToReviews?: boolean;
    canAccessReports?: boolean;
    canUpdatePricing?: boolean;
    canModifyFacilities?: boolean;
  };

  @Column({ nullable: true })
  parentUserId: number;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: 1 })
  status: number;

  @Column()
  createdBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;
}
