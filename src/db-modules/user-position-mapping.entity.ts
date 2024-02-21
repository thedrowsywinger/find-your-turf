import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './users.entity';
import { Positions } from './positions.entity';
import { Brands } from './brands.entity';
import { Fields } from './fields.entity';
import { v4 } from 'uuid';

@Entity()
export class UserPositionMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4()})
  code: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @ManyToOne(() => Positions)
  @JoinColumn({ name: 'positionId' })
  positionId: Positions;

  @ManyToOne(() => Brands)
  @JoinColumn({ name: 'brandId' })
  brandId: Brands;

  @ManyToOne(() => Fields)
  @JoinColumn({ name: 'fieldId' })
  fieldId: Fields;

  @Column({ default: 1 })
  status: number;
}
