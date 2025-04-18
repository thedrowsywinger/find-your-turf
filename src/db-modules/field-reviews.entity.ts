import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fields } from './fields.entity';
import { Users } from './users.entity';
import { Bookings } from './bookings.entity';

@Entity({ name: 'field_reviews' })
export class FieldReviews {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Fields)
    @JoinColumn({ name: 'fieldId' })
    fieldId: Fields;

    @ManyToOne(() => Users)
    @JoinColumn({ name: 'userId' })
    userId: Users;

    @ManyToOne(() => Bookings)
    @JoinColumn({ name: 'bookingId' })
    bookingId: Bookings;

    @Column()
    rating: number;

    @Column('text')
    review: string;

    @Column({ type: 'text', nullable: true })
    response: string;

    @Column({ type: 'timestamp', nullable: true })
    responseDate: Date;

    @Column()
    createdBy: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedBy: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ default: 1 })
    status: number;
}