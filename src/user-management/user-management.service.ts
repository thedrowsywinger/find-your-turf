import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Users, UserRole } from '../db-modules/users.entity';
import { AuditLogs, AuditActionType } from '../db-modules/audit-logs.entity';
import { CreateStaffUserDto, UpdateStaffUserDto } from './dto/staff-user.dto';
import { AuditLogQueryDto } from './dto/audit-log.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(AuditLogs)
    private auditLogsRepository: Repository<AuditLogs>,
  ) {}

  /**
   * Create a new staff user under a company/parent user
   */
  async createStaffUser(createStaffDto: CreateStaffUserDto, currentUser: any): Promise<Users> {
    // Verify if current user has the right to create staff
    await this.verifyCanManageStaff(currentUser);

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createStaffDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    try {
      // Apply default permissions based on role if not provided
      if (!createStaffDto.permissions) {
        createStaffDto.permissions = this.getDefaultPermissionsForRole(createStaffDto.role);
      }

      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createStaffDto.password, salt);

      // Create the new staff user
      const newStaff = this.usersRepository.create({
        username: createStaffDto.username,
        email: createStaffDto.email,
        password: hashedPassword,
        role: createStaffDto.role,
        permissions: createStaffDto.permissions,
        parentUserId: currentUser.id,
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
      });

      const savedUser = await this.usersRepository.save(newStaff);

      // Create audit log
      await this.createAuditLog(
        AuditActionType.STAFF_ADDED,
        currentUser.id,
        {
          description: `Created new staff user: ${savedUser.username} (${savedUser.role})`,
          metadata: {
            staffId: savedUser.id,
            staffEmail: savedUser.email,
            role: savedUser.role,
          }
        },
        null,
        null,
      );

      // Remove sensitive data before returning
      delete savedUser.password;
      delete savedUser.refreshToken;

      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create staff user');
    }
  }

  /**
   * Get all staff under a company/parent user
   */
  async getAllStaff(currentUser: any): Promise<Users[]> {
    // For security, only return staff if user is company or admin
    if (![UserRole.COMPANY, UserRole.ADMIN].includes(currentUser.role)) {
      if (currentUser.role === UserRole.FACILITY_MANAGER && currentUser.permissions?.canManageStaff) {
        // Facility managers with proper permissions can see staff under the same parent
        const staffUsers = await this.usersRepository.find({
          where: { parentUserId: currentUser.parentUserId },
          select: ['id', 'code', 'username', 'email', 'role', 'permissions', 'status', 'createdAt'],
          order: { createdAt: 'DESC' }
        });
        return staffUsers;
      }
      throw new ForbiddenException('Not authorized to view staff users');
    }

    // Company users can only see their own staff
    const staffUsers = await this.usersRepository.find({
      where: { parentUserId: currentUser.id },
      select: ['id', 'code', 'username', 'email', 'role', 'permissions', 'status', 'createdAt'],
      order: { createdAt: 'DESC' }
    });

    return staffUsers;
  }

  /**
   * Get a specific staff user
   */
  async getStaffById(staffId: number, currentUser: any): Promise<Users> {
    // Verify if current user has the right to manage staff
    await this.verifyCanManageStaff(currentUser);

    const staff = await this.usersRepository.findOne({
      where: { id: staffId },
      select: ['id', 'code', 'username', 'email', 'role', 'permissions', 'status', 'createdAt']
    });

    if (!staff) {
      throw new NotFoundException('Staff user not found');
    }

    // Verify that the staff belongs to the current user or same parent
    if (currentUser.role === UserRole.COMPANY && staff.parentUserId !== currentUser.id) {
      throw new ForbiddenException('Not authorized to access this staff member');
    }

    if (currentUser.role === UserRole.FACILITY_MANAGER && 
        staff.parentUserId !== currentUser.parentUserId) {
      throw new ForbiddenException('Not authorized to access this staff member');
    }

    return staff;
  }

  /**
   * Update a staff user
   */
  async updateStaffUser(staffId: number, updateStaffDto: UpdateStaffUserDto, currentUser: any): Promise<Users> {
    // Verify if current user has the right to manage staff
    await this.verifyCanManageStaff(currentUser);

    // Get the existing staff
    const staff = await this.usersRepository.findOne({
      where: { id: staffId }
    });

    if (!staff) {
      throw new NotFoundException('Staff user not found');
    }

    // Verify that the staff belongs to the current user or same parent
    if (currentUser.role === UserRole.COMPANY && staff.parentUserId !== currentUser.id) {
      throw new ForbiddenException('Not authorized to update this staff member');
    }

    if (currentUser.role === UserRole.FACILITY_MANAGER && 
        staff.parentUserId !== currentUser.parentUserId) {
      throw new ForbiddenException('Not authorized to update this staff member');
    }

    // Check for email uniqueness if updating email
    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateStaffDto.email }
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    try {
      // Record previous state for audit
      const previousState = { ...staff };
      delete previousState.password;
      delete previousState.refreshToken;

      // Update password if provided
      if (updateStaffDto.password) {
        const salt = await bcrypt.genSalt();
        updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, salt);
      }

      // Update the staff user
      const updates = {
        ...updateStaffDto,
        updatedBy: currentUser.id,
        updatedAt: new Date()
      };

      // Apply permissions based on role if changing role and not specifying permissions
      if (updateStaffDto.role && !updateStaffDto.permissions) {
        updates.permissions = this.getDefaultPermissionsForRole(updateStaffDto.role);
      }

      await this.usersRepository.update(staffId, updates);

      // Get the updated user
      const updatedUser = await this.usersRepository.findOne({
        where: { id: staffId },
        select: ['id', 'code', 'username', 'email', 'role', 'permissions', 'status', 'createdAt', 'updatedAt']
      });

      // Create audit log
      await this.createAuditLog(
        AuditActionType.STAFF_UPDATED,
        currentUser.id,
        {
          description: `Updated staff user: ${staff.username} (${staff.role})`,
          previousState,
          newState: updatedUser,
          metadata: {
            staffId: staff.id,
            changes: Object.keys(updateStaffDto).join(', ')
          }
        },
        null,
        null,
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update staff user');
    }
  }

  /**
   * Delete/deactivate a staff user
   */
  async removeStaffUser(staffId: number, currentUser: any): Promise<void> {
    // Verify if current user has the right to manage staff
    await this.verifyCanManageStaff(currentUser);

    // Get the staff user
    const staff = await this.usersRepository.findOne({
      where: { id: staffId }
    });

    if (!staff) {
      throw new NotFoundException('Staff user not found');
    }

    // Verify that the staff belongs to the current user or same parent
    if (currentUser.role === UserRole.COMPANY && staff.parentUserId !== currentUser.id) {
      throw new ForbiddenException('Not authorized to remove this staff member');
    }

    if (currentUser.role === UserRole.FACILITY_MANAGER && 
        staff.parentUserId !== currentUser.parentUserId) {
      throw new ForbiddenException('Not authorized to remove this staff member');
    }

    try {
      // Instead of deleting, set status to inactive (0)
      await this.usersRepository.update(staffId, {
        status: 0,
        updatedBy: currentUser.id,
        updatedAt: new Date()
      });

      // Create audit log
      await this.createAuditLog(
        AuditActionType.STAFF_REMOVED,
        currentUser.id,
        {
          description: `Deactivated staff user: ${staff.username} (${staff.role})`,
          metadata: {
            staffId: staff.id,
            staffEmail: staff.email,
            role: staff.role,
          }
        },
        null,
        null,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove staff user');
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(queryParams: AuditLogQueryDto, currentUser: any): Promise<{ logs: AuditLogs[], total: number }> {
    // Only admin, company, or facility manager with reports access can view logs
    if (![UserRole.ADMIN, UserRole.COMPANY].includes(currentUser.role) &&
        !(currentUser.role === UserRole.FACILITY_MANAGER && currentUser.permissions?.canAccessReports)) {
      throw new ForbiddenException('Not authorized to access audit logs');
    }

    try {
      // Build query filters
      const whereClause: FindOptionsWhere<AuditLogs> = {};

      // Company users can only see their audit logs
      if (currentUser.role === UserRole.COMPANY) {
        whereClause.userId = { id: currentUser.id } as any;
      }

      // Facility managers can only see logs related to their parent company
      if (currentUser.role === UserRole.FACILITY_MANAGER) {
        whereClause.userId = { id: currentUser.parentUserId } as any;
      }

      // Apply additional filters from query params
      if (queryParams.userId) {
        whereClause.userId = { id: queryParams.userId } as any;
      }

      if (queryParams.fieldId) {
        whereClause.fieldId = { id: queryParams.fieldId } as any;
      }

      if (queryParams.action) {
        whereClause.action = queryParams.action;
      }

      // Apply date range filter if provided
      if (queryParams.startDate && queryParams.endDate) {
        whereClause.timestamp = Between(
          new Date(queryParams.startDate),
          new Date(queryParams.endDate)
        );
      }

      // Calculate pagination
      const page = queryParams.page || 1;
      const limit = queryParams.limit || 10;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await this.auditLogsRepository.count({
        where: whereClause
      });

      // Get paginated results
      const logs = await this.auditLogsRepository.find({
        where: whereClause,
        skip,
        take: limit,
        order: { timestamp: 'DESC' },
        relations: ['userId', 'fieldId', 'brandId']
      });

      return {
        logs,
        total
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve audit logs');
    }
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(
    action: AuditActionType,
    userId: number,
    details: any,
    fieldId?: number,
    brandId?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLogs> {
    try {
      const auditLog = this.auditLogsRepository.create({
        action,
        userId: { id: userId } as any,
        details,
        fieldId: fieldId ? { id: fieldId } as any : null,
        brandId: brandId ? { id: brandId } as any : null,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      return await this.auditLogsRepository.save(auditLog);
    } catch (error) {
      // Log the error but don't fail the operation
      console.error('Failed to create audit log:', error);
      // Return null to indicate failure but allow the main operation to continue
      return null;
    }
  }

  /**
   * Helper method to verify if a user can manage staff
   */
  private async verifyCanManageStaff(user: any): Promise<void> {
    // Admin can always manage staff
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // Company users can manage their own staff
    if (user.role === UserRole.COMPANY) {
      return;
    }

    // Facility managers need the canManageStaff permission
    if (user.role === UserRole.FACILITY_MANAGER && user.permissions?.canManageStaff) {
      return;
    }

    throw new ForbiddenException('Not authorized to manage staff users');
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissionsForRole(role: UserRole): any {
    switch (role) {
      case UserRole.FACILITY_MANAGER:
        return {
          canManageStaff: true,
          canManageBookings: true,
          canUpdateSchedules: true,
          canRespondToReviews: true,
          canAccessReports: true,
          canUpdatePricing: true,
          canModifyFacilities: true
        };
      case UserRole.MAINTENANCE_STAFF:
        return {
          canManageStaff: false,
          canManageBookings: false,
          canUpdateSchedules: true,
          canRespondToReviews: false,
          canAccessReports: false,
          canUpdatePricing: false,
          canModifyFacilities: false
        };
      case UserRole.CUSTOMER_SERVICE:
        return {
          canManageStaff: false,
          canManageBookings: true,
          canUpdateSchedules: false,
          canRespondToReviews: true,
          canAccessReports: true,
          canUpdatePricing: false,
          canModifyFacilities: false
        };
      default:
        return {};
    }
  }
}
