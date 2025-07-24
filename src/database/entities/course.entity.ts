import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { CourseSubject } from './course_subject.entity';
import { SupervisorCourse } from './supervisor_course.entity';
import { UserCourse } from './user_course.entity';
import { CourseStatus } from '../dto/course.dto';
import { DefaultLength } from 'src/helper/constants/emtities.constant';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  courseId: number;

  @Column({
    type: 'varchar',
    length: DefaultLength,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
    nullable: false,
  })
  status: CourseStatus;

  @Column({
    type: 'date',
    nullable: false,
  })
  start: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  end: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdCourses)
  creator: User;

  @OneToMany(() => CourseSubject, (cs) => cs.course)
  courseSubjects: CourseSubject[];

  @OneToMany(() => SupervisorCourse, (sc) => sc.course)
  supervisorCourses: SupervisorCourse[];

  @OneToMany(() => UserCourse, (uc) => uc.course)
  userCourses: UserCourse[];
}
