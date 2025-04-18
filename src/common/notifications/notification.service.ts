import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class NotificationService {
    // private transporter: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly loggingService: LoggingService
    ) {
        // Commented out until email configuration is ready
        // this.initializeTransporter();
    }

    /* Commented out until email configuration is ready
    private initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS')
            }
        });
    }
    */

    private async sendEmail(to: string, subject: string, html: string) {
        try {
            // Temporarily log email details instead of sending
            console.log('==== Email Details ====');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Content:', html);
            console.log('====================');
            
            this.loggingService.log('Email logged (not sent - email config pending)', { to, subject });
        } catch (error) {
            this.loggingService.error('Failed to log email', error.stack);
            throw error;
        }
    }

    async sendBookingConfirmation(data: {
        id: number;
        userEmail: string;
        fieldName: string;
        startTime: Date;
        duration: number;
        totalAmount: number;
        fieldAddress: string;
        status?: string;
        refundAmount?: number;
    }) {
        const subject = data.status === 'CANCELLED' 
            ? 'Booking Cancellation Confirmation'
            : 'Booking Confirmation';

        let html = `
            <h2>${subject}</h2>
            <p>Dear User,</p>
            ${data.status === 'CANCELLED' 
                ? `<p>Your booking has been cancelled successfully. A refund of ${data.refundAmount} will be processed.</p>`
                : `<p>Your booking has been confirmed!</p>`
            }
            <h3>Booking Details:</h3>
            <ul>
                <li>Booking ID: ${data.id}</li>
                <li>Field: ${data.fieldName}</li>
                <li>Address: ${data.fieldAddress}</li>
                <li>Date & Time: ${new Date(data.startTime).toLocaleString()}</li>
                <li>Duration: ${data.duration} minutes</li>
                ${!data.status ? `<li>Total Amount: ${data.totalAmount}</li>` : ''}
            </ul>
            <p>Thank you for using Find Your Turf!</p>
        `;

        await this.sendEmail(data.userEmail, subject, html);
    }

    async sendBookingReminder(data: {
        id: number;
        userEmail: string;
        fieldName: string;
        startTime: Date;
        duration: number;
        fieldAddress: string;
    }) {
        const subject = 'Reminder: Your Upcoming Booking';
        const html = `
            <h2>Booking Reminder</h2>
            <p>Dear User,</p>
            <p>This is a reminder for your upcoming booking tomorrow:</p>
            <h3>Booking Details:</h3>
            <ul>
                <li>Booking ID: ${data.id}</li>
                <li>Field: ${data.fieldName}</li>
                <li>Address: ${data.fieldAddress}</li>
                <li>Date & Time: ${new Date(data.startTime).toLocaleString()}</li>
                <li>Duration: ${data.duration} minutes</li>
            </ul>
            <p>We look forward to seeing you!</p>
        `;

        await this.sendEmail(data.userEmail, subject, html);
    }

    async sendReviewNotification(data: {
        id: number;
        fieldName: string;
        fieldOwnerEmail: string;
        rating: number;
        review: string;
    }) {
        const subject = 'New Review Received';
        const html = `
            <h2>New Review Posted</h2>
            <p>Dear Field Owner,</p>
            <p>Your field "${data.fieldName}" has received a new review:</p>
            <h3>Review Details:</h3>
            <ul>
                <li>Rating: ${data.rating} stars</li>
                <li>Review: "${data.review}"</li>
            </ul>
            <p>Thank you for being part of Find Your Turf!</p>
        `;

        await this.sendEmail(data.fieldOwnerEmail, subject, html);
    }
}