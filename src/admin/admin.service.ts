import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Users, UserRole } from '../db-modules/users.entity';
import { Bookings, BookingStatus } from '../db-modules/bookings.entity';
import { Fields } from '../db-modules/fields.entity';
import { LoggingService } from '../common/logging/logging.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(Bookings)
        private bookingsRepository: Repository<Bookings>,
        @InjectRepository(Fields)
        private fieldsRepository: Repository<Fields>,
        private loggingService: LoggingService,
    ) {}

    async getAllUsers(query: { role?: UserRole, status?: number, page?: number, limit?: number } = {}) {
        const { role, status, page = 1, limit = 10 } = query;
        
        const queryBuilder = this.usersRepository.createQueryBuilder('user');

        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        if (status !== undefined) {
            queryBuilder.andWhere('user.status = :status', { status });
        }

        const total = await queryBuilder.getCount();
        const users = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.createdAt', 'DESC')
            .getMany();

        // Remove sensitive data
        users.forEach(user => {
            delete user.password;
            delete user.refreshToken;
        });

        return {
            items: users,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }

    async updateUserStatus(userId: number, status: number, adminId: number) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.status = status;
        user.updatedBy = adminId;
        
        const updatedUser = await this.usersRepository.save(user);
        this.loggingService.audit('USER_STATUS_UPDATED', adminId, {
            userId,
            oldStatus: user.status,
            newStatus: status
        });

        return updatedUser;
    }

    async getSystemStats(dateRange?: { start: Date; end: Date }) {
        const range = dateRange || {
            start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            end: new Date()
        };

        const [
            totalUsers,
            activeBookings,
            totalRevenue,
            activeFields
        ] = await Promise.all([
            this.usersRepository.count(),
            this.bookingsRepository.count({
                where: {
                    status: BookingStatus.CONFIRMED,
                    startTime: Between(range.start, range.end)
                }
            }),
            this.bookingsRepository
                .createQueryBuilder('booking')
                .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
                .andWhere('booking.createdAt BETWEEN :start AND :end', range)
                .select('SUM(booking.amount)', 'total')
                .getRawOne(),
            this.fieldsRepository.count({ where: { status: 1 } })
        ]);

        return {
            totalUsers,
            activeBookings,
            totalRevenue: totalRevenue?.total || 0,
            activeFields,
            dateRange: range
        };
    }

    async getBookingStats(dateRange?: { start: Date; end: Date }) {
        const range = dateRange || {
            start: new Date(new Date().setDate(new Date().getDate() - 30)),
            end: new Date()
        };

        const bookings = await this.bookingsRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.fieldId', 'field')
            .leftJoinAndSelect('booking.userId', 'user')
            .where('booking.createdAt BETWEEN :start AND :end', range)
            .orderBy('booking.createdAt', 'DESC')
            .getMany();

        const stats = {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
            cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
            pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
            revenue: bookings
                .filter(b => b.status === BookingStatus.CONFIRMED)
                .reduce((sum, booking) => sum + Number(booking.amount), 0)
        };

        return { stats, bookings };
    }

    async getUserActivity(userId: number) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const bookings = await this.bookingsRepository.find({
            where: { userId: { id: userId } },
            relations: ['fieldId'],
            order: { createdAt: 'DESC' }
        });

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            },
            activity: {
                totalBookings: bookings.length,
                confirmedBookings: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
                cancelledBookings: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
                totalSpent: bookings
                    .filter(b => b.status === BookingStatus.CONFIRMED)
                    .reduce((sum, booking) => sum + Number(booking.amount), 0)
            },
            recentBookings: bookings.slice(0, 5)
        };
    }
}