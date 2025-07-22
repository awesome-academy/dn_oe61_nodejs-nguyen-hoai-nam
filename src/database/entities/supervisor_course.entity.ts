import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

@Entity()
export class SupervisorCourse {
  @PrimaryGeneratedColumn()
  supervisorCourseId: number;

  @ManyToOne(() => Course, course => course.supervisorCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, user => user.supervisedCourses)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User;
}
