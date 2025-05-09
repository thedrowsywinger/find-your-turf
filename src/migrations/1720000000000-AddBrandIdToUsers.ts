import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandIdToUsers1720000000000 implements MigrationInterface {
    name = 'AddBrandIdToUsers1720000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add brandId column to users table
        await queryRunner.query(`ALTER TABLE "users" ADD "brandId" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_brands" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL`);
        
        // Update existing company users with brands
        // This will set the brandId to the brand they created
        await queryRunner.query(`
            UPDATE "users" u
            SET "brandId" = (
                SELECT id FROM "brands" b
                WHERE b."createdBy" = u.id
                LIMIT 1
            )
            WHERE u.role = 'company'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_brands"`);
        
        // Remove brandId column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "brandId"`);
    }
} 