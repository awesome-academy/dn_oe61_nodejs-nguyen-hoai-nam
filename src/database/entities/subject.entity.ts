import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { CourseSubject } from './course_subject.entity';
import { DefaultLength } from 'src/helper/constants/emtities.constant';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  subjectId: number;

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
    type: 'int',
    nullable: false,
  })
  studyDuration: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdSubjects)
  creator: User;

  @OneToMany(() => Task, (task) => task.subject)
  tasks: Task[];

  @OneToMany(() => CourseSubject, (cs) => cs.subject)
  courseSubjects: CourseSubject[];
}
