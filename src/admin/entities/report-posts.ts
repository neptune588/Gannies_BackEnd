import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';

@Entity('report_posts')
export class ReportPostsEntity {
  @PrimaryGeneratedColumn()
  reportPostId: number;

  // 신고자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reporter: UsersEntity;

  // 신고된 글의 ID
  @Column('int')
  reportedPostId: number;

  // 신고된 글의 내용
  @Column('text')
  reportedContent: string;

  // 신고된 글의 작성자
  @ManyToOne(() => UsersEntity, (user) => user.userId)
  reportedPerson: UsersEntity;

  // 신고일
  @CreateDateColumn()
  dateReported: Date;
}