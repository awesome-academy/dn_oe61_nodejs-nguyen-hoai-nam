import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subject } from './subject.entity';
import { Course } from './course.entity';
import { SupervisorCourse } from './supervisor_course.entity';
import { UserCourse } from './user_course.entity';
import { UserSubject } from './user_subject.entity';
import { Role, UserStatus } from '../dto/user.dto';
import { DefaultLength } from 'src/helper/constants/emtities.constant';
import { ChatMessage } from './chat_message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({
    type: 'varchar',
    length: DefaultLength,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  userName: string;

  @Column({
    type: 'varchar',
    length: DefaultLength,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.SUPERVISOR,
    nullable: false,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: false,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Subject, (subject) => subject.creator)
  createdSubjects: Subject[];

  @OneToMany(() => Course, (course) => course.creator)
  createdCourses: Course[];

  @OneToMany(() => SupervisorCourse, (sc) => sc.supervisor)
  supervisedCourses: SupervisorCourse[];

  @OneToMany(() => UserCourse, (uc) => uc.user)
  userCourses: UserCourse[];

  @OneToMany(() => UserSubject, (us) => us.user)
  userSubjects: UserSubject[];

  @OneToMany(() => ChatMessage, (message) => message.sender)
  chatMessages: ChatMessage[];
}
