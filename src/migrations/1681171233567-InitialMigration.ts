import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1681171233567 implements MigrationInterface {
    name = 'InitialMigration1681171233567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'company', 'consumer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT 'a0d6a417-e0f1-4d21-afac-a470dd13e4cd', "username" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'consumer', "refreshToken" character varying, "status" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "positions" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT '11c23a9b-6204-4fe1-bd48-fc6505f9da90', "name" character varying(255) NOT NULL, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT 'b67cb69e-d8b4-423e-8bb6-e2322915a17a', "name" character varying(255) NOT NULL, "hq" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "status" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."field_schedules_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`);
        await queryRunner.query(`CREATE TABLE "field_schedules" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT '6be9d0e2-b3b8-41f8-b06f-0ec6fcb20cc3', "dayOfWeek" "public"."field_schedules_dayofweek_enum" NOT NULL, "openTime" TIME NOT NULL, "closeTime" TIME NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "specialPrice" numeric(10,2), "validFrom" date, "validUntil" date, "status" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fieldId" integer, CONSTRAINT "PK_2b39f043c86ff5a6859db58ebaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT '83aba171-d21e-42cd-bb1e-5f6f51ba59a6', "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "amount" numeric(10,2) NOT NULL, "duration" integer NOT NULL, "totalAmount" numeric(10,2) NOT NULL, "notes" text, "active" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "fieldId" integer, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "field_reviews" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "review" text NOT NULL, "response" text, "responseDate" TIMESTAMP, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" integer NOT NULL DEFAULT '1', "fieldId" integer, "userId" integer, "bookingId" integer, CONSTRAINT "PK_9c84a27be944ba0c3bc9a9bcff3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fields_sporttype_enum" AS ENUM('football', 'cricket', 'basketball', 'table_tennis', 'other')`);
        await queryRunner.query(`CREATE TABLE "fields" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT 'c1c9ad6e-b7ee-483f-b0d1-eb01ad66ca86', "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "country" character varying(255) NOT NULL, "description" text NOT NULL, "sportType" "public"."fields_sporttype_enum" NOT NULL DEFAULT 'other', "pricePerHour" numeric(10,2) NOT NULL DEFAULT '0', "averageRating" numeric(3,2) NOT NULL DEFAULT '0', "status" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "brandId" integer, CONSTRAINT "PK_ee7a215c6cd77a59e2cb3b59d41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_position_mapping" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT '9698ae83-ddde-4530-b558-a49c0e5aae57', "status" integer NOT NULL DEFAULT '1', "userId" integer, "positionId" integer, "brandId" integer, "fieldId" integer, CONSTRAINT "PK_8a3bb0fc5e26bf3abad5e020f81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL DEFAULT 'e710f639-1832-4bf2-abe3-58a46c542ad5', "rent" integer NOT NULL, "duration" integer NOT NULL, "unit" character varying(255) NOT NULL, "status" integer NOT NULL DEFAULT '1', "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" integer, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "validFrom" TIMESTAMP NOT NULL DEFAULT now(), "validTill" TIMESTAMP NOT NULL DEFAULT now(), "fieldId" integer, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "field_schedules" ADD CONSTRAINT "FK_0abdc774193d17747cf2724d8c4" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_8814b570b6bd4e3a68b8a16fee5" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "field_reviews" ADD CONSTRAINT "FK_686330ae0ee9a17bb1cb851190b" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "field_reviews" ADD CONSTRAINT "FK_4bb56041626ac4c5487776a2ed0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "field_reviews" ADD CONSTRAINT "FK_a7c2654b3de6903d42eb82c9af7" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fields" ADD CONSTRAINT "FK_cfc874d326b20cc829e9786851b" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" ADD CONSTRAINT "FK_273f5387dfe232665bda8321857" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" ADD CONSTRAINT "FK_4dcac88507d2bd6f654886b344a" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" ADD CONSTRAINT "FK_9cac63463ce6401011c58044440" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" ADD CONSTRAINT "FK_d0c2aa334017dd9cac081ba8a4a" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_abe9895c19a521e781fc8793e12" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_abe9895c19a521e781fc8793e12"`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" DROP CONSTRAINT "FK_d0c2aa334017dd9cac081ba8a4a"`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" DROP CONSTRAINT "FK_9cac63463ce6401011c58044440"`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" DROP CONSTRAINT "FK_4dcac88507d2bd6f654886b344a"`);
        await queryRunner.query(`ALTER TABLE "user_position_mapping" DROP CONSTRAINT "FK_273f5387dfe232665bda8321857"`);
        await queryRunner.query(`ALTER TABLE "fields" DROP CONSTRAINT "FK_cfc874d326b20cc829e9786851b"`);
        await queryRunner.query(`ALTER TABLE "field_reviews" DROP CONSTRAINT "FK_a7c2654b3de6903d42eb82c9af7"`);
        await queryRunner.query(`ALTER TABLE "field_reviews" DROP CONSTRAINT "FK_4bb56041626ac4c5487776a2ed0"`);
        await queryRunner.query(`ALTER TABLE "field_reviews" DROP CONSTRAINT "FK_686330ae0ee9a17bb1cb851190b"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_8814b570b6bd4e3a68b8a16fee5"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "field_schedules" DROP CONSTRAINT "FK_0abdc774193d17747cf2724d8c4"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TABLE "user_position_mapping"`);
        await queryRunner.query(`DROP TABLE "fields"`);
        await queryRunner.query(`DROP TYPE "public"."fields_sporttype_enum"`);
        await queryRunner.query(`DROP TABLE "field_reviews"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "field_schedules"`);
        await queryRunner.query(`DROP TYPE "public"."field_schedules_dayofweek_enum"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "positions"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
