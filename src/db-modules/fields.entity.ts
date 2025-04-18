import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Brands } from './brands.entity';
import { FieldSchedules } from './field-schedules.entity';
import { FieldReviews } from './field-reviews.entity';
import { FieldPricing } from './field-pricing.entity';
import { v4 } from 'uuid';

export enum SportType {
  FOOTBALL = 'football',
  CRICKET = 'cricket',
  BASKETBALL = 'basketball',
  TABLE_TENNIS = 'table_tennis',
  OTHER = 'other'
}

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

  @Column({
    type: 'enum',
    enum: SportType,
    default: SportType.OTHER
  })
  sportType: SportType;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @ManyToOne(() => Brands)
  @JoinColumn({ name: 'brandId' })
  brandId: Brands;

  @OneToMany(() => FieldSchedules, schedule => schedule.fieldId)
  fieldSchedules: FieldSchedules[];

  @OneToMany(() => FieldReviews, review => review.fieldId)
  reviews: FieldReviews[];

  @OneToMany(() => FieldPricing, pricing => pricing.fieldId)
  pricing: FieldPricing[];

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
