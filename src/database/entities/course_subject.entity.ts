import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { Subject } from './subject.entity';
import { UserSubject } from './user_subject.entity';
import { CourseSubjectStatus } from '../dto/course_subject.dto';

@Entity()
export class CourseSubject {
  @PrimaryGeneratedColumn()
  courseSubjectId: number;

  @ManyToOne(() => Course, course => course.courseSubjects)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Subject, subject => subject.courseSubjects)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({
    type: 'enum',
    enum: CourseSubjectStatus,
    default: CourseSubjectStatus.NOT_STARTED,
    nullable: false
  })
  status: CourseSubjectStatus;

  @OneToMany(() => UserSubject, us => us.courseSubject)
  userSubjects: UserSubject[];
}
