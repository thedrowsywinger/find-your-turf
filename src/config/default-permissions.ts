import { UserRole } from '../db-modules/users.entity';

export const DEFAULT_STAFF_PERMISSIONS = {
    [UserRole.FACILITY_MANAGER]: {
        canManageStaff: true,
        canManageBookings: true,
        canUpdateSchedules: true,
        canRespondToReviews: true,
        canAccessReports: true,
        canUpdatePricing: true,
        canModifyFacilities: true
    },
    [UserRole.MAINTENANCE_STAFF]: {
        canManageStaff: false,
        canManageBookings: false,
        canUpdateSchedules: true,
        canRespondToReviews: false,
        canAccessReports: false,
        canUpdatePricing: false,
        canModifyFacilities: false
    },
    [UserRole.CUSTOMER_SERVICE]: {
        canManageStaff: false,
        canManageBookings: true,
        canUpdateSchedules: false,
        canRespondToReviews: true,
        canAccessReports: true,
        canUpdatePricing: false,
        canModifyFacilities: false
    }
};