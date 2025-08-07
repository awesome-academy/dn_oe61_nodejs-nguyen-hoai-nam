import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserSubject } from './user_subject.entity';
import { Task } from './task.entity';
import { UserTaskStatus } from '../dto/user_task.dto';

@Entity()
export class UserTask {
  @PrimaryGeneratedColumn()
  userTaskId: number;

  @ManyToOne(() => UserSubject, us => us.userTasks)
  @JoinColumn({ name: 'user_subject_id' })
  userSubject: UserSubject;

  @ManyToOne(() => Task, task => task.userTasks)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({
    type: 'enum',
    enum: UserTaskStatus,
    default: UserTaskStatus.IN_PROGRESS,
    nullable: false
  })
  status: UserTaskStatus;

  @Column({ type: 'datetime', nullable: true })
  doneAt?: Date;
}

