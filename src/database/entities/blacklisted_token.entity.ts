import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'blacklisted_tokens' })
export class BlacklistedToken {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn('varchar', { length: 500 })
    token: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}