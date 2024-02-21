import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4()})
  code: string;

  @Column({ length: 255 })
  username: string;

  @Column({ length: 255 })
  email: string;

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
