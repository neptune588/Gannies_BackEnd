import { UsersEntity } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
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

  // 신고 삭제일
  // 기본 상태는 null, 삭제하면 날짜
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
