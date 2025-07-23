import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subject } from './subject.entity';
import { UserTask } from './user_task.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  taskId: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  fileUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Subject, (subject) => subject.tasks)
  subject: Subject;

  @OneToMany(() => UserTask, (ut) => ut.task)
  userTasks: UserTask[];
}
