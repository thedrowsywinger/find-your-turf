import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { Brands } from 'src/db-modules/brands.entity';
import { Fields } from 'src/db-modules/fields.entity';
import { FieldPricing } from 'src/db-modules/field-pricing.entity';
import { Bookings, BookingStatus } from 'src/db-modules/bookings.entity';
import { FieldSchedules, DayOfWeek, RecurrenceType } from 'src/db-modules/field-schedules.entity';
import { FieldReviews } from 'src/db-modules/field-reviews.entity';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not, In } from 'typeorm';
import { FieldInfoDto } from './dto/field-info.dto';
import { ListFieldFilterQueryDto } from './dto/list-field-query.dto';
import { FieldScheduleDto, UpdateFieldScheduleDto } from './dto/field-schedule.dto';
import { CreateFieldReviewDto, RespondToReviewDto } from './dto/field-review.dto';
import { LoggingService } from '../common/logging/logging.service';
import { NotificationService } from '../common/notifications/notification.service';
import { format, parseISO, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns';

@Injectable()
export class FieldManagementService {
    constructor(
        @InjectRepository(Fields)
        private readonly fieldRepository: Repository<Fields>,
        @InjectRepository(FieldPricing)
        private readonly fieldPricingRepository: Repository<FieldPricing>,
        @InjectRepository(Brands)
        private readonly brandRepository: Repository<Brands>,
        @InjectRepository(Bookings)
        private readonly bookingRepository: Repository<Bookings>,
        @InjectRepository(FieldSchedules)
        private readonly fieldScheduleRepository: Repository<FieldSchedules>,
        @InjectRepository(FieldReviews)
        private readonly fieldReviewRepository: Repository<FieldReviews>,
        private readonly loggingService: LoggingService,
        private readonly notificationService: NotificationService,
    ) {}

    async listFieldsService(query: ListFieldFilterQueryDto): Promise<any> {
        try {
            const {
                name,
                address,
                city,
                country,
                brandId,
                availableFrom,
                availableTo,
                minPrice,
                maxPrice,
                sportType,
                dayOfWeek,
                timeSlot,
                minRating,
                maxRating,
                hasReviews,
                page = 1,
                limit = 10
            } = query;

            // Build base query
            const queryBuilder = this.fieldRepository
                .createQueryBuilder('field')
                .leftJoinAndSelect('field.brandId', 'brand')
                .where('field.status = :status', { status: 1 }); // Only active fields

            // Apply basic filters
            if (name) {
                queryBuilder.andWhere('field.name ILIKE :name', { name: `%${name}%` });
            }
            if (address) {
                queryBuilder.andWhere('field.address ILIKE :address', { address: `%${address}%` });
            }
            if (city) {
                queryBuilder.andWhere('field.city ILIKE :city', { city: `%${city}%` });
            }
            if (country) {
                queryBuilder.andWhere('field.country ILIKE :country', { country: `%${country}%` });
            }
            if (brandId) {
                queryBuilder.andWhere('brand.id = :brandId', { brandId });
            }
            if (sportType) {
                queryBuilder.andWhere('field.sportType = :sportType', { sportType });
            }
            if (minPrice !== undefined) {
                queryBuilder.andWhere('field.pricePerHour >= :minPrice', { minPrice });
            }
            if (maxPrice !== undefined) {
                queryBuilder.andWhere('field.pricePerHour <= :maxPrice', { maxPrice });
            }

            // Apply rating filters
            if (minRating !== undefined) {
                queryBuilder.andWhere('field.averageRating >= :minRating', { minRating });
            }
            if (maxRating !== undefined) {
                queryBuilder.andWhere('field.averageRating <= :maxRating', { maxRating });
            }

            // Filter by has reviews
            if (hasReviews === 'true') {
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from('field_reviews', 'review')
                        .where('review.fieldId = field.id')
                        .andWhere('review.status = 1')
                        .getQuery();
                    return 'EXISTS ' + subQuery;
                });
            }

            // Check schedule availability if dayOfWeek or timeSlot is provided
            if (dayOfWeek || timeSlot) {
                queryBuilder.leftJoin('field.fieldSchedules', 'schedule');
                
                if (dayOfWeek) {
                    queryBuilder.andWhere('schedule.dayOfWeek = :dayOfWeek', { dayOfWeek });
                }
                if (timeSlot) {
                    queryBuilder.andWhere('schedule.openTime <= :timeSlot', { timeSlot })
                              .andWhere('schedule.closeTime >= :timeSlot', { timeSlot })
                              .andWhere('schedule.isAvailable = true');
                }
            }

            // Check booking availability if dates are provided
            if (availableFrom && availableTo) {
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('booking.fieldId')
                        .from(Bookings, 'booking')
                        .where('booking.status = :bookingStatus', { bookingStatus: BookingStatus.CONFIRMED })
                        .andWhere(
                            '(booking.startTime < :availableTo AND booking.endTime > :availableFrom)',
                            { availableFrom: new Date(availableFrom), availableTo: new Date(availableTo) }
                        )
                        .getQuery();
                    return 'field.id NOT IN ' + subQuery;
                });
            }

            // Add pagination
            const total = await queryBuilder.getCount();
            const fields = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('field.createdAt', 'DESC')
                .getMany();

            // If requesting specific time availability, fetch schedule details
            if (timeSlot || dayOfWeek) {
                for (const field of fields) {
                    const schedules = await this.fieldScheduleRepository.find({
                        where: { fieldId: { id: field.id }, isAvailable: true },
                        order: { dayOfWeek: 'ASC', openTime: 'ASC' },
                    });
                    (field as any).schedules = schedules;
                }
            }

            if (fields.length === 0) {
                return {
                    data: {
                        items: [],
                        total: 0,
                        page,
                        limit,
                        pages: 0
                    },
                    error: ApiResponseMessages.NO_FIELDS_AVAILABLE_AT_THE_MOMENT
                };
            }

            return {
                data: {
                    items: fields,
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                },
                error: null
            };
        } catch (error) {
            this.loggingService.error('Error in listFieldsService:', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async createField(fieldInfo: FieldInfoDto, userId: number): Promise<Fields> {
        // First create the field without pricing
        const field = this.fieldRepository.create({
            name: fieldInfo.name,
            address: fieldInfo.address,
            city: fieldInfo.city,
            country: fieldInfo.country,
            description: fieldInfo.description,
            sportType: fieldInfo.sportType,
            brandId: { id: fieldInfo.brandId }, // Properly reference the brand
            createdBy: userId,
            status: 1
        });
        
        const savedField = await this.fieldRepository.save(field);

        if (fieldInfo.pricing && fieldInfo.pricing.length > 0) {
            const pricingEntities = fieldInfo.pricing.map(pricing => 
                this.fieldPricingRepository.create({
                    fieldId: { id: savedField.id }, // Properly reference the field
                    price: pricing.price,
                    durationInMinutes: pricing.durationInMinutes,
                    createdBy: userId,
                    status: 1
                })
            );

            await this.fieldPricingRepository.save(pricingEntities);
        }

        return this.fieldRepository.findOne({
            where: { id: savedField.id },
            relations: ['pricing', 'brandId']
        });
    }

    async getFieldDetails(id: number): Promise<Fields> {
        return this.fieldRepository.findOne({
            where: { id },
            relations: ['pricing', 'fieldSchedules', 'reviews'],
        });
    }

    async updateFieldPricing(fieldId: number, pricing: FieldInfoDto['pricing'], userId: number): Promise<void> {
        // Delete existing pricing
        await this.fieldPricingRepository.delete({ fieldId: { id: fieldId } });

        // Create new pricing entries
        if (pricing && pricing.length > 0) {
            const pricingEntities = pricing.map(price => 
                this.fieldPricingRepository.create({
                    fieldId: { id: fieldId },
                    price: price.price,
                    durationInMinutes: price.durationInMinutes,
                    createdBy: userId,
                    updatedBy: userId,
                })
            );

            await this.fieldPricingRepository.save(pricingEntities);
        }
    }

    async addFieldsService(body: FieldInfoDto): Promise<any> {
        let brand: Brands | undefined = await this.brandRepository.findOne({ where: { id: body.brandId } });
        if (!brand) return { data: null, error: ApiResponseMessages.INVALID_BRAND };

        try {
            const fieldData = {
                ...body,
                brandId: brand
            };
            
            let newField = await this.fieldRepository.save(fieldData);
            return { data: newField, error: null };
        } catch (error) {
            console.error('Error in addFieldsService:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async addFieldSchedule(fieldId: number, scheduleDto: FieldScheduleDto, userId: number) {
        const field = await this.fieldRepository.findOne({ where: { id: fieldId } });
        if (!field) {
            return { data: null, error: ApiResponseMessages.INVALID_FIELD };
        }

        // Validate time blocks if provided
        if (scheduleDto.timeBlocks?.length > 0) {
            const isValid = this.validateTimeBlocks(scheduleDto.timeBlocks, scheduleDto.openTime, scheduleDto.closeTime);
            if (!isValid) {
                return { data: null, error: 'Time blocks must be within schedule operating hours' };
            }
        }

        // Handle recurrence configuration
        if (scheduleDto.recurrenceType !== RecurrenceType.WEEKLY) {
            const isValidRecurrence = this.validateRecurrenceConfig(scheduleDto.recurrenceConfig);
            if (!isValidRecurrence) {
                return { data: null, error: 'Invalid recurrence configuration' };
            }
        }

        const schedule = this.fieldScheduleRepository.create({
            ...scheduleDto,
            fieldId: field,
            createdBy: userId,
        });

        try {
            const savedSchedule = await this.fieldScheduleRepository.save(schedule);
            this.loggingService.audit('FIELD_SCHEDULE_ADDED', userId, {
                fieldId,
                scheduleId: savedSchedule.id,
            });
            return { data: savedSchedule, error: null };
        } catch (error) {
            this.loggingService.error('Error adding field schedule', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async updateFieldSchedule(fieldId: number, updateDto: UpdateFieldScheduleDto, userId: number) {
        const schedule = await this.fieldScheduleRepository.findOne({
            where: { id: updateDto.scheduleId, fieldId: { id: fieldId } },
        });

        if (!schedule) {
            return { data: null, error: 'Schedule not found' };
        }

        // Validate time blocks if provided
        if (updateDto.timeBlocks?.length > 0) {
            const isValid = this.validateTimeBlocks(updateDto.timeBlocks, updateDto.openTime, updateDto.closeTime);
            if (!isValid) {
                return { data: null, error: 'Time blocks must be within schedule operating hours' };
            }
        }

        // Handle recurrence configuration
        if (updateDto.recurrenceType !== RecurrenceType.WEEKLY) {
            const isValidRecurrence = this.validateRecurrenceConfig(updateDto.recurrenceConfig);
            if (!isValidRecurrence) {
                return { data: null, error: 'Invalid recurrence configuration' };
            }
        }

        try {
            Object.assign(schedule, {
                ...updateDto,
                updatedBy: userId,
            });

            const updatedSchedule = await this.fieldScheduleRepository.save(schedule);
            this.loggingService.audit('FIELD_SCHEDULE_UPDATED', userId, {
                fieldId,
                scheduleId: updatedSchedule.id,
            });
            return { data: updatedSchedule, error: null };
        } catch (error) {
            this.loggingService.error('Error updating field schedule', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async getFieldSchedules(fieldId: number) {
        try {
            const schedules = await this.fieldScheduleRepository.find({
                where: { fieldId: { id: fieldId } },
                order: { dayOfWeek: 'ASC', openTime: 'ASC' },
            });

            return { data: schedules, error: null };
        } catch (error) {
            this.loggingService.error('Error fetching field schedules', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async deleteFieldSchedule(fieldId: number, scheduleId: number, userId: number) {
        const schedule = await this.fieldScheduleRepository.findOne({
            where: { id: scheduleId, fieldId: { id: fieldId } },
        });

        if (!schedule) {
            return { data: null, error: 'Schedule not found' };
        }

        try {
            await this.fieldScheduleRepository.remove(schedule);
            this.loggingService.audit('FIELD_SCHEDULE_DELETED', userId, {
                fieldId,
                scheduleId,
            });
            return { data: true, error: null };
        } catch (error) {
            this.loggingService.error('Error deleting field schedule', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async checkFieldAvailability(fieldId: number, date: Date) {
        const dayOfWeek = format(date, 'EEEE').toLowerCase() as DayOfWeek;
        const timeStr = format(date, 'HH:mm:ss');

        const schedules = await this.fieldScheduleRepository.find({
            where: {
                fieldId: { id: fieldId },
                isAvailable: true,
                status: 1,
            },
        });

        if (!schedules.length) {
            return { available: false, reason: 'No schedules available for this field' };
        }

        // Find applicable schedule based on recurrence rules
        const applicableSchedule = this.findApplicableSchedule(schedules, date);
        if (!applicableSchedule) {
            return { available: false, reason: 'No schedule available for this time' };
        }

        // Check if the time falls within a specific time block
        if (applicableSchedule.timeBlocks?.length > 0) {
            const availableBlock = this.findAvailableTimeBlock(applicableSchedule.timeBlocks, timeStr);
            if (!availableBlock) {
                return { available: false, reason: 'No available time block for this time' };
            }

            // Check existing bookings for this block
            const existingBooking = await this.bookingRepository.findOne({
                where: {
                    fieldId: { id: fieldId },
                    status: BookingStatus.CONFIRMED,
                    startTime: LessThanOrEqual(date),
                    endTime: MoreThanOrEqual(date),
                },
            });

            if (existingBooking) {
                return { 
                    available: false, 
                    reason: 'Time slot already booked',
                    schedule: applicableSchedule,
                    timeBlock: availableBlock
                };
            }

            return {
                available: true,
                schedule: applicableSchedule,
                timeBlock: availableBlock,
                specialPrice: availableBlock.price || applicableSchedule.specialPrice
            };
        }

        // Regular schedule check
        const existingBooking = await this.bookingRepository.findOne({
            where: {
                fieldId: { id: fieldId },
                status: BookingStatus.CONFIRMED,
                startTime: LessThanOrEqual(date),
                endTime: MoreThanOrEqual(date),
            },
        });

        return {
            available: !existingBooking,
            reason: existingBooking ? 'Time slot already booked' : null,
            schedule: applicableSchedule,
            specialPrice: applicableSchedule.specialPrice
        };
    }

    private validateTimeBlocks(timeBlocks: any[], openTime: string, closeTime: string): boolean {
        const parseTimeToMinutes = (timeStr: string): number => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const openMinutes = parseTimeToMinutes(openTime);
        const closeMinutes = parseTimeToMinutes(closeTime);

        return timeBlocks.every(block => {
            const blockStartMinutes = parseTimeToMinutes(block.startTime);
            const blockEndMinutes = parseTimeToMinutes(block.endTime);
            return blockStartMinutes >= openMinutes && 
                   blockEndMinutes <= closeMinutes && 
                   blockStartMinutes < blockEndMinutes;
        });
    }

    private validateRecurrenceConfig(config: any): boolean {
        if (!config) return false;

        if (config.interval && (!Number.isInteger(config.interval) || config.interval < 1)) {
            return false;
        }

        if (config.monthlyDays) {
            if (!Array.isArray(config.monthlyDays) || 
                !config.monthlyDays.every((day: number) => Number.isInteger(day) && day >= 1 && day <= 31)) {
                return false;
            }
        }

        if (config.endDate) {
            try {
                parseISO(config.endDate);
            } catch {
                return false;
            }
        }

        if (config.exceptions) {
            if (!Array.isArray(config.exceptions)) return false;
            try {
                config.exceptions.forEach((date: string) => parseISO(date));
            } catch {
                return false;
            }
        }

        return true;
    }

    private findApplicableSchedule(schedules: FieldSchedules[], date: Date): FieldSchedules | null {
        const dayOfWeek = format(date, 'EEEE').toLowerCase() as DayOfWeek;
        
        return schedules.find(schedule => {
            // Check if schedule matches the day
            if (schedule.dayOfWeek !== dayOfWeek) return false;

            // Check if date falls within operating hours
            const timeStr = format(date, 'HH:mm:ss');
            if (timeStr < schedule.openTime || timeStr > schedule.closeTime) return false;

            // Check recurrence rules
            switch (schedule.recurrenceType) {
                case RecurrenceType.DAILY:
                    return this.checkDailyRecurrence(schedule, date);
                case RecurrenceType.WEEKLY:
                    return true; // Basic weekly recurrence always applies if day matches
                case RecurrenceType.BIWEEKLY:
                    return this.checkBiweeklyRecurrence(schedule, date);
                case RecurrenceType.MONTHLY:
                    return this.checkMonthlyRecurrence(schedule, date);
                case RecurrenceType.CUSTOM:
                    return this.checkCustomRecurrence(schedule, date);
                default:
                    return false;
            }
        }) || null;
    }

    private findAvailableTimeBlock(timeBlocks: any[], timeStr: string): any | null {
        return timeBlocks.find(block => 
            timeStr >= block.startTime && timeStr <= block.endTime
        ) || null;
    }

    private checkDailyRecurrence(schedule: FieldSchedules, date: Date): boolean {
        if (!schedule.recurrenceConfig?.interval) return true;
        
        const startDate = schedule.createdAt;
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff % schedule.recurrenceConfig.interval === 0;
    }

    private checkBiweeklyRecurrence(schedule: FieldSchedules, date: Date): boolean {
        const startDate = schedule.createdAt;
        const weeksDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        return weeksDiff % 2 === 0;
    }

    private checkMonthlyRecurrence(schedule: FieldSchedules, date: Date): boolean {
        if (!schedule.recurrenceConfig?.monthlyDays) return false;
        return schedule.recurrenceConfig.monthlyDays.includes(date.getDate());
    }

    private checkCustomRecurrence(schedule: FieldSchedules, date: Date): boolean {
        if (!schedule.recurrenceConfig) return false;

        // Check end date
        if (schedule.recurrenceConfig.endDate) {
            const endDate = parseISO(schedule.recurrenceConfig.endDate.toString());
            if (date > endDate) return false;
        }

        // Check exceptions
        if (schedule.recurrenceConfig.exceptions?.some(exception => 
            isSameDay(date, parseISO(exception.toString())))) {
            return false;
        }

        // Check days of week if specified
        if (schedule.recurrenceConfig.daysOfWeek?.length > 0) {
            const dayOfWeek = format(date, 'EEEE').toLowerCase() as DayOfWeek;
            return schedule.recurrenceConfig.daysOfWeek.includes(dayOfWeek);
        }

        return true;
    }

    async createFieldReview(fieldId: number, userId: number, reviewDto: CreateFieldReviewDto) {
        // Verify booking exists and belongs to the user
        const booking = await this.bookingRepository.findOne({
            where: {
                id: reviewDto.bookingId,
                userId: { id: userId },
                fieldId: { id: fieldId },
                status: BookingStatus.CONFIRMED
            }
        });

        if (!booking) {
            return { data: null, error: 'Invalid booking or unauthorized' };
        }

        // Check if review already exists for this booking
        const existingReview = await this.fieldReviewRepository.findOne({
            where: { bookingId: { id: reviewDto.bookingId } }
        });

        if (existingReview) {
            return { data: null, error: 'Review already exists for this booking' };
        }

        try {
            const review = this.fieldReviewRepository.create({
                fieldId: { id: fieldId },
                userId: { id: userId },
                bookingId: { id: reviewDto.bookingId },
                rating: reviewDto.rating,
                review: reviewDto.review,
                createdBy: userId
            });

            const savedReview = await this.fieldReviewRepository.save(review);

            // Update field average rating
            await this.updateFieldAverageRating(fieldId);

            // Get field and owner details for notification
            const field = await this.fieldRepository.findOne({
                where: { id: fieldId },
                relations: ['brandId']
            });

            if (field && field.brandId) {
                await this.notificationService.sendReviewNotification({
                    id: savedReview.id,
                    fieldName: field.name,
                    fieldOwnerEmail: field.brandId.contactEmail,
                    rating: reviewDto.rating,
                    review: reviewDto.review
                });
            }

            this.loggingService.audit('FIELD_REVIEW_CREATED', userId, {
                fieldId,
                reviewId: savedReview.id
            });

            return { data: savedReview, error: null };
        } catch (error) {
            this.loggingService.error('Error creating field review', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async respondToReview(reviewId: number, userId: number, responseDto: RespondToReviewDto) {
        const review = await this.fieldReviewRepository.findOne({
            where: { id: reviewId },
            relations: ['fieldId', 'fieldId.brandId']
        });

        if (!review) {
            return { data: null, error: 'Review not found' };
        }

        // Verify user owns the field (through brand)
        const field = await this.fieldRepository.findOne({
            where: { id: review.fieldId.id },
            relations: ['brandId']
        });

        if (!field || field.brandId.id !== userId) {
            return { data: null, error: 'Unauthorized to respond to this review' };
        }

        try {
            review.response = responseDto.response;
            review.responseDate = new Date();
            review.updatedBy = userId;

            const updatedReview = await this.fieldReviewRepository.save(review);

            this.loggingService.audit('FIELD_REVIEW_RESPONSE_ADDED', userId, {
                reviewId,
                fieldId: field.id
            });

            return { data: updatedReview, error: null };
        } catch (error) {
            this.loggingService.error('Error responding to review', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async getFieldReviews(fieldId: number, page = 1, limit = 10) {
        try {
            const [reviews, total] = await this.fieldReviewRepository.findAndCount({
                where: { fieldId: { id: fieldId }, status: 1 },
                relations: ['userId', 'bookingId'],
                order: { createdAt: 'DESC' },
                skip: (page - 1) * limit,
                take: limit
            });

            // Remove sensitive user data
            reviews.forEach(review => {
                if (review.userId) {
                    delete review.userId.password;
                    delete review.userId.refreshToken;
                }
            });

            return {
                data: {
                    items: reviews,
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                },
                error: null
            };
        } catch (error) {
            this.loggingService.error('Error fetching field reviews', error.stack);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    private async updateFieldAverageRating(fieldId: number) {
        try {
            const result = await this.fieldReviewRepository
                .createQueryBuilder('review')
                .where('review.fieldId = :fieldId', { fieldId })
                .select('AVG(review.rating)', 'avgRating')
                .getRawOne();

            await this.fieldRepository.update(
                { id: fieldId },
                { averageRating: result.avgRating || 0 }
            );
        } catch (error) {
            this.loggingService.error('Error updating field average rating', error.stack);
        }
    }
}
