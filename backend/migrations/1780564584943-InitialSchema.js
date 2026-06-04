/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class InitialSchema1780564584943 {
    name = 'InitialSchema1780564584943'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "movie" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" varchar NOT NULL,
                "date" varchar,
                "image" varchar,
                "synopsis" text,
                "rating" float,
                "banner" varchar,
                "duration" integer,
                "budget" bigint,
                "tagline" varchar,
                "original_language" varchar,
                "director" varchar,
                "actors" varchar,
                "keywords" text,
                "trailer_key" varchar,
                "revenue" bigint,
                "status" varchar,
                "homepage" varchar,
                "genres" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "rating" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "userId" integer NOT NULL,
                "movieId" integer NOT NULL,
                "score" integer NOT NULL,
                CONSTRAINT "UNIQUE_USER_MOVIE" UNIQUE ("userId", "movieId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "email" varchar NOT NULL,
                "password" varchar,
                "firstname" varchar NOT NULL,
                "lastname" varchar NOT NULL,
                "theme" varchar NOT NULL DEFAULT ('light'),
                "isPublic" boolean NOT NULL DEFAULT (1),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
            )
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "rating"
        `);
        await queryRunner.query(`
            DROP TABLE "movie"
        `);
    }
}
