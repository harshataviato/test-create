/**
 * Module: Task Model
 * Description: Defines the data structure and database schema for a Task.
 * Uses TypeORM decorators, conceptually identical to JPA/Hibernate annotations (@Entity, @Column).
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("tasks") // Maps this class to the 'tasks' table in the database
export class Task {

    /**
     * Primary Key: Auto-incrementing integer ID.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Title of the task.
     * Business Rule: Cannot be null. Maximum length handled by default varchar(255).
     */
    @Column({ type: "varchar", length: 255 })
    title: string;

    /**
     * Detailed description of the task.
     * Edge case: Users might not provide a description, so we allow nulls.
     */
    @Column({ type: "text", nullable: true })
    description: string;

    /**
     * Status of the task.
     * Business Rule: By default, newly created tasks are NOT completed.
     */
    @Column({ type: "boolean", default: false })
    isCompleted: boolean;

    /**
     * Timestamp for creation. Automatically managed by TypeORM.
     */
    @CreateDateColumn()
    createdAt: Date;

    /**
     * Timestamp for last update. Automatically managed by TypeORM.
     */
    @UpdateDateColumn()
    updatedAt: Date;
}
