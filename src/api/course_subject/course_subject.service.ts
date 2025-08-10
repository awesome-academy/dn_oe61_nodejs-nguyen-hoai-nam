import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSubjectStatus } from 'src/database/dto/course_subject.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { Subject } from 'src/database/entities/subject.entity';
import { CreateCourseWithSubjectsDto, DeleteCourseSubjectResult, GetByIdCourseWithSubjectsDto } from 'src/helper/interface/course_subject.interface';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class CourseSubjectService {
    constructor(
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        private readonly dataSource: DataSource,
        private readonly i18nUtils: I18nUtils
    ) { }

    async getById(courseId: number, lang: string): Promise<CreateCourseWithSubjectsDto> {
        const courseSubjects: CourseSubject[] = await this.courseSubjectRepo.find({
            where: {
                course: {
                    courseId: courseId
                }
            },
            relations: ['course', 'subject'],
        });

        if (courseSubjects.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course_subject.subject_not_found'));
        }

        const course = {
            courseId: courseSubjects[0].course.courseId,
            name: courseSubjects[0].course.name,
            description: courseSubjects[0].course.description,
            status: courseSubjects[0].course.status,
            start: courseSubjects[0].course.start,
            end: courseSubjects[0].course.end,
        };

        const subjects = courseSubjects.map(cs => ({
            subjectId: cs.subject.subjectId,
            name: cs.subject.name,
            description: cs.subject.description,
            studyDuration: cs.subject.studyDuration,
            status: cs.status,
        }));

        const datas: CreateCourseWithSubjectsDto = {
            course: course,
            subjects: subjects
        };

        return datas;
    }

    async create(courseId: number, subjectIds: number[], lang: string): Promise<GetByIdCourseWithSubjectsDto> {
        const uniqueSubjectIds = Array.from(new Set(subjectIds));
        return await this.dataSource.transaction(async (manager) => {
            await this.validateBeforeCreateCourseSubject(courseId, subjectIds, lang, manager);
            await this.checkCourseSubject(courseId, subjectIds, lang, manager);

            const courseSubjects = manager.getRepository(CourseSubject).create(
                uniqueSubjectIds.map((subjectId) => ({
                    course: { courseId },
                    subject: { subjectId },
                    status: CourseSubjectStatus.NOT_STARTED,
                }))
            );
            await manager.getRepository(CourseSubject).save(courseSubjects);

            const { course: dataCourse, subjects: dataSubjects } = await this.formatData(courseId, manager, lang);

            return {
                course: dataCourse,
                subjects: dataSubjects
            };
        });
    }

    private async validateBeforeCreateCourseSubject(courseId: number, subjectIds: number[], lang: string, manager: EntityManager): Promise<void> {
        const course = await manager.getRepository(Course).findOneBy({ courseId });
        if (!course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }

        const subjects = await manager.getRepository(Subject).findBy({ subjectId: In(subjectIds) });
        if (subjects.length !== subjectIds.length) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_not_found', {}, lang));
        }
    }

    private async checkCourseSubject(courseId: number, subjectIds: number[], lang: string, manager: EntityManager): Promise<void> {
        const existing = await manager.getRepository(CourseSubject).find({
            where: {
                course: { courseId },
                subject: In(subjectIds),
            },
        });

        if (existing.length > 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course_subject.already_exists', {}, lang));
        }
    }

    private async formatData(courseId: number, manager: EntityManager, lang: string): Promise<GetByIdCourseWithSubjectsDto> {
        const courseSubjects = await manager.getRepository(CourseSubject).find({
            where: { course: { courseId } },
            relations: ['course', 'subject'],
        });

        if (courseSubjects.length === 0 || !courseSubjects[0].course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course_subject.course_subject_not_found', {}, lang));
        }

        const subjects = courseSubjects.map((cs) => cs.subject);

        const course = courseSubjects[0]?.course;
        const dataCourse = {
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            status: course.status,
            start: course.start,
            end: course.end,
        };

        const dataSubjects = subjects.map((s) => ({
            subjectId: s.subjectId,
            name: s.name,
            description: s.description,
            studyDuration: s.studyDuration,
        }));

        return { course: dataCourse, subjects: dataSubjects };
    }

    async delete(courseId: number, subjectIds: number[], lang: string): Promise<DeleteCourseSubjectResult> {
        const uniqueSubjectIds = Array.from(new Set(subjectIds));
        const deletedSubjectIds: number[] = [];

        await this.dataSource.transaction(async (manager) => {
            for (const subjectId of uniqueSubjectIds) {
                const courseSubjects = await manager.getRepository(CourseSubject).find({
                    where: {
                        course: { courseId },
                        subject: { subjectId },
                    },
                });

                if (courseSubjects.length === 0) {
                    throw new BadRequestException(
                        this.i18nUtils.translate('validation.course_subject.course_subject_not_found', {}, lang)
                    );
                }

                await manager.getRepository(CourseSubject).remove(courseSubjects);
                deletedSubjectIds.push(subjectId);
            }
        });

        return {
            deleted: deletedSubjectIds,
            totalDeleted: deletedSubjectIds.length,
        };
    }


}
