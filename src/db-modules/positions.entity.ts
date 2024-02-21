import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';

@Entity({ name: 'positions' })
export class Positions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, default: v4()})
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ default: 1 })
  status: number;
}
