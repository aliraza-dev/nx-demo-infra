import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      host: process.env['POSTGRES_HOST'] || 'localhost',
      port: parseInt(process.env['POSTGRES_PORT'] || '5432', 10),
      user: process.env['POSTGRES_USER'] || 'postgres',
      password: process.env['POSTGRES_PASSWORD'] || 'postgrespassword',
      database: process.env['POSTGRES_DB'] || 'postgres',
      connectionTimeoutMillis: 5000,
    });

    try {
      await this.initDatabase();
      this.logger.log('Database connected and initialized successfully');
    } catch (error) {
      this.logger.warn(
        `Failed to connect to PostgreSQL during startup: ${
          error instanceof Error ? error.message : String(error)
        }. Ensure PostgreSQL is running.`,
      );
    }
  }

  async initDatabase() {
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'developer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'developer';
    `;
    await this.pool.query(createUsersTableQuery);
    this.logger.log('Users table and role column verified/created in database');
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const seedUsers = [
        { email: 'admin', role: 'admin' },
        { email: 'admin@example.com', role: 'admin' },
      ];

      for (const u of seedUsers) {
        await this.pool.query(
          `INSERT INTO users (email, password, role, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE
           SET password = EXCLUDED.password, role = EXCLUDED.role, updated_at = NOW()`,
          [u.email, hashedPassword, u.role],
        );
      }
      this.logger.log(
        'Default admin user(s) verified/seeded (email: "admin", "admin@example.com", password: "admin", role: "admin")',
      );
    } catch (error) {
      this.logger.error(
        `Failed to seed admin user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
