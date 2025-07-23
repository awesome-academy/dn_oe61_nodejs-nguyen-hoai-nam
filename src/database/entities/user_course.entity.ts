import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';
import { UserCourseStatus } from '../dto/user_course.dto';

@Entity()
export class UserCourse {
  @PrimaryGeneratedColumn()
  userCourseId: number;

  @ManyToOne(() => Course, course => course.userCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, user => user.userCourses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'date',
    nullable: false,
  })
  registrationDate: string;

  @Column({
    type: 'float',
    default: 0,
    nullable: false,
  })
  courseProgress: number;

  @Column({
    type: 'enum',
    enum: UserCourseStatus,
    default: UserCourseStatus.RESIGN,
    nullable: false,
  })
  status: UserCourseStatus;
}
