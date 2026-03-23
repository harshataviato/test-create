/**
 * Module: User Model
 * Description: Represents the User entity in the database.
 * This is equivalent to a Java @Entity class using JPA/Hibernate.
 */

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

/**
 * Class representing a User record.
 * Annotated with TypeORM decorators to map to a relational database table.
 */
@Entity("users")
export class User {
    /**
     * The unique identifier for the user.
     * Auto-incremented primary key.
     */
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * The first name of the user.
     * Cannot be null.
     */
    @Column({ type: "varchar", length: 100 })
    firstName: string;

    /**
     * The last name of the user.
     * Cannot be null.
     */
    @Column({ type: "varchar", length: 100 })
    lastName: string;

    /**
     * The email address of the user.
     * Must be unique to prevent duplicate registrations.
     */
    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    /**
     * A boolean flag indicating if the user is active.
     * Defaults to true for new registrations.
     */
    @Column({ type: "boolean", default: true })
    isActive: boolean;
}
