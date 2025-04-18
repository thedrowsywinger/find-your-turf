import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Bookings, BookingStatus } from '../db-modules/bookings.entity';
import { Fields } from '../db-modules/fields.entity';
import { Users } from '../db-modules/users.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiResponseMessages } from '../common/api-response-messages';
import { LoggingService } from '../common/logging/logging.service';
import { NotificationService } from '../common/notifications/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingRepository: Repository<Bookings>,
    @InjectRepository(Fields)
    private readonly fieldRepository: Repository<Fields>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly loggingService: LoggingService,
    private readonly notificationService: NotificationService,
  ) {}

  private async checkFieldAvailability(
    fieldId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
  ): Promise<boolean> {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.fieldId = :fieldId', { fieldId })
      .andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime }
      );

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const conflictingBookings = await queryBuilder.getCount();
    return conflictingBookings === 0;
  }

  async createBooking(createBookingDto: CreateBookingDto, userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { data: null, error: 'User not found' };
    }

    const field = await this.fieldRepository.findOne({
      where: { id: createBookingDto.fieldId },
      relations: ['brandId']
    });
    if (!field) {
      return { data: null, error: ApiResponseMessages.INVALID_FIELD };
    }

    try {
      const booking = this.bookingRepository.create({
        ...createBookingDto,
        userId: user,
        fieldId: field,
        status: BookingStatus.CONFIRMED,
        createdBy: userId
      });

      const savedBooking = await this.bookingRepository.save(booking);

      // Send booking confirmation email
      await this.notificationService.sendBookingConfirmation({
        id: savedBooking.id,
        userEmail: user.email,
        fieldName: field.name,
        startTime: savedBooking.startTime,
        duration: savedBooking.duration,
        totalAmount: savedBooking.totalAmount,
        fieldAddress: field.address
      });

      // Schedule booking reminder (24 hours before)
      const reminderTime = new Date(savedBooking.startTime);
      reminderTime.setHours(reminderTime.getHours() - 24);
      const currentTime = new Date();
      
      if (reminderTime > currentTime) {
        setTimeout(async () => {
          await this.notificationService.sendBookingReminder({
            id: savedBooking.id,
            userEmail: user.email,
            fieldName: field.name,
            startTime: savedBooking.startTime,
            duration: savedBooking.duration,
            fieldAddress: field.address
          });
        }, reminderTime.getTime() - currentTime.getTime());
      }

      this.loggingService.audit('BOOKING_CREATED', userId, {
        bookingId: savedBooking.id,
        fieldId: field.id
      });

      return { data: savedBooking, error: null };
    } catch (error) {
      this.loggingService.error('Error creating booking:', error.stack);
      return { data: null, error: ApiResponseMessages.BOOKING_CREATION_FAILED };
    }
  }

  async getUserBookings(userId: number): Promise<any> {
    try {
      const bookings = await this.bookingRepository.find({
        where: { userId: { id: userId } },
        relations: ['fieldId'],
        order: { createdAt: 'DESC' },
      });

      return { data: bookings, error: null };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { data: null, error: ApiResponseMessages.BOOKING_FETCH_FAILED };
    }
  }

  async cancelBooking(bookingId: number, userId: number): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['userId', 'fieldId']
    });

    if (!booking) {
      return { data: null, error: ApiResponseMessages.BOOKING_NOT_FOUND };
    }

    if (booking.userId.id !== userId) {
      return { data: null, error: ApiResponseMessages.UNAUTHORIZED };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return { data: null, error: ApiResponseMessages.BOOKING_ALREADY_CANCELLED };
    }

    try {
      booking.status = BookingStatus.CANCELLED;
      booking.updatedBy = userId;
      const updatedBooking = await this.bookingRepository.save(booking);

      // Send cancellation notification
      await this.notificationService.sendBookingConfirmation({
        id: updatedBooking.id,
        userEmail: booking.userId.email,
        fieldName: booking.fieldId.name,
        fieldAddress: booking.fieldId.address,
        startTime: booking.startTime,
        duration: booking.duration,
        status: 'CANCELLED',
        totalAmount: booking.totalAmount,
        refundAmount: booking.totalAmount // Assuming full refund
      });

      this.loggingService.audit('BOOKING_CANCELLED', userId, {
        bookingId: booking.id,
        fieldId: booking.fieldId.id
      });

      return { data: updatedBooking, error: null };
    } catch (error) {
      this.loggingService.error('Error cancelling booking:', error.stack);
      return { data: null, error: ApiResponseMessages.BOOKING_CANCELLATION_FAILED };
    }
  }

  async confirmBooking(bookingId: number): Promise<any> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['fieldId'],
      });

      if (!booking) {
        return { data: null, error: ApiResponseMessages.BOOKING_NOT_FOUND };
      }

      if (booking.status !== BookingStatus.PENDING) {
        return { data: null, error: 'Booking is not in pending status' };
      }

      // Recheck availability before confirming
      const isAvailable = await this.checkFieldAvailability(
        booking.fieldId.id,
        booking.startTime,
        booking.endTime,
        booking.id
      );

      if (!isAvailable) {
        booking.status = BookingStatus.CANCELLED;
        await this.bookingRepository.save(booking);
        return { data: null, error: ApiResponseMessages.FIELD_NOT_AVAILABLE };
      }

      booking.status = BookingStatus.CONFIRMED;
      const confirmedBooking = await this.bookingRepository.save(booking);
      return { data: confirmedBooking, error: null };
    } catch (error) {
      console.error('Error confirming booking:', error);
      return { data: null, error: 'Failed to confirm booking' };
    }
  }

  async getBookingDetails(bookingId: number, userId: number): Promise<any> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { 
          id: bookingId,
          userId: { id: userId }
        },
        relations: ['fieldId', 'userId']
      });

      if (!booking) {
        return { data: null, error: ApiResponseMessages.BOOKING_NOT_FOUND };
      }

      // Remove sensitive user data
      if (booking.userId) {
        delete booking.userId.password;
        delete booking.userId.refreshToken;
      }

      return { data: booking, error: null };
    } catch (error) {
      this.loggingService.error('Error fetching booking details', error.stack);
      return { data: null, error: ApiResponseMessages.BOOKING_FETCH_FAILED };
    }
  }
}