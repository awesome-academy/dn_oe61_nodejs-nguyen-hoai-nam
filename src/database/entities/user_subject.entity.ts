import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { CourseSubject } from './course_subject.entity';
import { UserTask } from './user_task.entity';
import { UserSubjectStatus } from '../dto/user_subject.dto';

@Entity()
export class UserSubject {
  @PrimaryGeneratedColumn()
  userSubjectId: number;

  @ManyToOne(() => User, user => user.userSubjects)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CourseSubject, cs => cs.userSubjects)
  @JoinColumn({ name: 'course_subject_id' })
  courseSubject: CourseSubject;

  @Column({
    type: 'float',
    default: 0,
    nullable: false,
  })
  subjectProgress: number;

  @Column({
    type: 'enum',
    enum: UserSubjectStatus,
    default: UserSubjectStatus.IN_PROGRESS
  })
  status: UserSubjectStatus;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;

  @OneToMany(() => UserTask, ut => ut.userSubject)
  userTasks: UserTask[];
}
