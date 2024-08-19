import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BasePostsEntity } from 'src/posts/entities/base-posts.entity';

@Entity('likes')
export class LikeEntity {
  // ID
  @PrimaryGeneratedColumn()
  id: number;

  // 좋아요 누른 사람
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  // 여러 개의 좋아요는 1개의 게시물에 달릴 수 있음.
  @ManyToOne(() => BasePostsEntity, (post) => post.id)
  post: BasePostsEntity;

  // 좋아요 누른 날짜
  @CreateDateColumn()
  createdAt: Date;
}