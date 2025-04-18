import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Users, UserRole } from '../db-modules/users.entity';
import { AuditLogs, AuditActionType } from '../db-modules/audit-logs.entity';
import { CreateStaffDto, UpdateStaffPermissionsDto, ListStaffQueryDto } from './dto/staff-management.dto';
import { LoggingService } from '../common/logging/logging.service';
import { DEFAULT_STAFF_PERMISSIONS } from '../config/default-permissions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffManagementService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(AuditLogs)
        private readonly auditLogsRepository: Repository<AuditLogs>,
        private readonly loggingService: LoggingService,
    ) {}

    private async createAuditLog(action: AuditActionType, userId: number, details: any, error?: any) {
        try {
            const log = this.auditLogsRepository.create({
                userId: { id: userId },
                action,
                details: {
                    ...details,
                    error: error ? {
                        message: error.message,
                        stack: error.stack,
                        timestamp: new Date()
                    } : undefined
                }
            });
            await this.auditLogsRepository.save(log);
        } catch (logError) {
            this.loggingService.error('Failed to create audit log:', logError.stack);
        }
    }

    async createStaffMember(createStaffDto: CreateStaffDto, companyUserId: number) {
        const companyUser = await this.usersRepository.findOne({
            where: { id: companyUserId, role: UserRole.COMPANY }
        });

        if (!companyUser) {
            const error = new UnauthorizedException('Only company owners can create staff accounts');
            await this.createAuditLog(
                AuditActionType.STAFF_ADDED,
                companyUserId,
                { attempted: createStaffDto },
                error
            );
            throw error;
        }

        try {
            const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);
            
            // Apply default permissions based on role if none provided
            const permissions = createStaffDto.permissions || 
                DEFAULT_STAFF_PERMISSIONS[createStaffDto.role] || {};

            const staffMember = this.usersRepository.create({
                ...createStaffDto,
                password: hashedPassword,
                parentUserId: companyUserId,
                permissions,
                createdBy: companyUserId
            });

            const savedStaff = await this.usersRepository.save(staffMember);

            await this.createAuditLog(
                AuditActionType.STAFF_ADDED,
                companyUserId,
                {
                    staffId: savedStaff.id,
                    role: savedStaff.role,
                    permissions: savedStaff.permissions
                }
            );

            delete savedStaff.password;
            return { data: savedStaff, error: null };
        } catch (error) {
            await this.createAuditLog(
                AuditActionType.STAFF_ADDED,
                companyUserId,
                { attempted: createStaffDto },
                error
            );
            this.loggingService.error('Error creating staff member:', error.stack);
            return { data: null, error: 'Failed to create staff member' };
        }
    }

    async updateStaffPermissions(
        staffId: number,
        updateDto: UpdateStaffPermissionsDto,
        companyUserId: number
    ) {
        const staffMember = await this.usersRepository.findOne({
            where: { id: staffId, parentUserId: companyUserId }
        });

        if (!staffMember) {
            const error = new Error('Staff member not found or unauthorized');
            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { staffId, attempted: updateDto },
                error
            );
            return { data: null, error: error.message };
        }

        const previousPermissions = { ...staffMember.permissions };

        try {
            staffMember.permissions = updateDto.permissions;
            staffMember.updatedBy = companyUserId;

            const updatedStaff = await this.usersRepository.save(staffMember);

            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                {
                    staffId,
                    previousPermissions,
                    newPermissions: updateDto.permissions,
                    changes: this.getPermissionChanges(previousPermissions, updateDto.permissions)
                }
            );

            return { data: updatedStaff, error: null };
        } catch (error) {
            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { staffId, attempted: updateDto },
                error
            );
            this.loggingService.error('Error updating staff permissions:', error.stack);
            return { data: null, error: 'Failed to update staff permissions' };
        }
    }

    private getPermissionChanges(previous: any, current: any) {
        const changes = {
            added: {},
            removed: {},
            modified: {}
        };

        // Check for added or modified permissions
        for (const [key, value] of Object.entries(current)) {
            if (!(key in previous)) {
                changes.added[key] = value;
            } else if (previous[key] !== value) {
                changes.modified[key] = {
                    from: previous[key],
                    to: value
                };
            }
        }

        // Check for removed permissions
        for (const key of Object.keys(previous)) {
            if (!(key in current)) {
                changes.removed[key] = previous[key];
            }
        }

        return changes;
    }

    async listStaffMembers(companyUserId: number, query: ListStaffQueryDto) {
        try {
            const queryBuilder = this.usersRepository
                .createQueryBuilder('user')
                .where('user.parentUserId = :companyUserId', { companyUserId });

            if (query.role) {
                queryBuilder.andWhere('user.role = :role', { role: query.role });
            }

            if (query.search) {
                queryBuilder.andWhere(
                    '(user.username ILIKE :search OR user.email ILIKE :search)',
                    { search: `%${query.search}%` }
                );
            }

            const staff = await queryBuilder
                .orderBy('user.createdAt', 'DESC')
                .getMany();

            staff.forEach(member => delete member.password);

            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { action: 'list_staff', query }
            );

            return { data: staff, error: null };
        } catch (error) {
            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { action: 'list_staff', query },
                error
            );
            this.loggingService.error('Error listing staff members:', error.stack);
            return { data: null, error: 'Failed to list staff members' };
        }
    }

    async removeStaffMember(staffId: number, companyUserId: number) {
        const staffMember = await this.usersRepository.findOne({
            where: { id: staffId, parentUserId: companyUserId }
        });

        if (!staffMember) {
            const error = new Error('Staff member not found or unauthorized');
            await this.createAuditLog(
                AuditActionType.STAFF_REMOVED,
                companyUserId,
                { staffId },
                error
            );
            return { data: null, error: error.message };
        }

        try {
            const staffDetails = {
                id: staffMember.id,
                username: staffMember.username,
                email: staffMember.email,
                role: staffMember.role,
                permissions: staffMember.permissions
            };

            await this.usersRepository.remove(staffMember);

            await this.createAuditLog(
                AuditActionType.STAFF_REMOVED,
                companyUserId,
                {
                    removedStaff: staffDetails,
                    timestamp: new Date()
                }
            );

            return { data: true, error: null };
        } catch (error) {
            await this.createAuditLog(
                AuditActionType.STAFF_REMOVED,
                companyUserId,
                { staffId },
                error
            );
            this.loggingService.error('Error removing staff member:', error.stack);
            return { data: null, error: 'Failed to remove staff member' };
        }
    }

    async getStaffAuditLogs(staffId: number, companyUserId: number) {
        const staffMember = await this.usersRepository.findOne({
            where: { id: staffId, parentUserId: companyUserId }
        });

        if (!staffMember) {
            return { data: null, error: 'Staff member not found or unauthorized' };
        }

        try {
            const logs = await this.auditLogsRepository.find({
                where: { userId: { id: staffId } },
                order: { timestamp: 'DESC' },
                relations: ['fieldId', 'brandId']
            });

            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { action: 'view_audit_logs', staffId }
            );

            return { data: logs, error: null };
        } catch (error) {
            await this.createAuditLog(
                AuditActionType.STAFF_UPDATED,
                companyUserId,
                { action: 'view_audit_logs', staffId },
                error
            );
            this.loggingService.error('Error fetching staff audit logs:', error.stack);
            return { data: null, error: 'Failed to fetch staff audit logs' };
        }
    }
}