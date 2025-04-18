import { MigrationInterface, QueryRunner } from "typeorm";

export class StaffManagementAndAuditLogs1681171233568 implements MigrationInterface {
    name = 'StaffManagementAndAuditLogs1681171233568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new user roles
        await queryRunner.query(`
            ALTER TYPE public."users_role_enum" ADD VALUE IF NOT EXISTS 'facility_manager';
            ALTER TYPE public."users_role_enum" ADD VALUE IF NOT EXISTS 'maintenance_staff';
            ALTER TYPE public."users_role_enum" ADD VALUE IF NOT EXISTS 'customer_service';
        `);

        // Add permissions and parentUserId columns to users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "permissions" JSONB,
            ADD COLUMN IF NOT EXISTS "parent_user_id" integer
        `);

        // Create audit_action_type enum
        await queryRunner.query(`
            CREATE TYPE public."audit_action_type_enum" AS ENUM (
                'booking_created', 'booking_updated', 'booking_cancelled',
                'schedule_created', 'schedule_updated', 'schedule_deleted',
                'pricing_updated', 'staff_added', 'staff_updated',
                'staff_removed', 'facility_updated', 'review_response',
                'maintenance_log', 'customer_service_action'
            )
        `);

        // Create audit_logs table
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" SERIAL NOT NULL,
                "code" character varying(255) NOT NULL,
                "user_id" integer,
                "field_id" integer,
                "brand_id" integer,
                "action" public."audit_action_type_enum" NOT NULL,
                "details" JSONB NOT NULL,
                "ip_address" inet,
                "user_agent" character varying(255),
                "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "status" integer NOT NULL DEFAULT 1,
                CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "audit_logs"
            ADD CONSTRAINT "FK_audit_logs_user" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_audit_logs_field" 
            FOREIGN KEY ("field_id") 
            REFERENCES "fields"("id") ON DELETE SET NULL,
            ADD CONSTRAINT "FK_audit_logs_brand" 
            FOREIGN KEY ("brand_id") 
            REFERENCES "brands"("id") ON DELETE SET NULL
        `);

        // Add foreign key for parent user relationship
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_parent_user" 
            FOREIGN KEY ("parent_user_id") 
            REFERENCES "users"("id") ON DELETE SET NULL
        `);

        // Add indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_audit_logs_timestamp" ON "audit_logs" ("timestamp");
            CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action");
            CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id");
            CREATE INDEX "IDX_users_parent_user_id" ON "users" ("parent_user_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_timestamp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_parent_user_id"`);

        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_user"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_field"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_brand"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_parent_user"`);

        // Drop audit_logs table
        await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);

        // Drop audit_action_type enum
        await queryRunner.query(`DROP TYPE IF EXISTS public."audit_action_type_enum"`);

        // Remove new columns from users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "permissions",
            DROP COLUMN IF EXISTS "parent_user_id"
        `);

        // Note: We cannot remove enum values in PostgreSQL, 
        // but they will not affect the system negatively
    }
}