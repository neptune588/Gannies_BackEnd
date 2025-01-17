import { Injectable } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/auth/dto';
import { EMembershipStatus } from './enums';

@Injectable()
export class UsersDAO {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  // 회원 엔티티 생성
  async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const newUser = new UsersEntity();
    Object.assign(newUser, createUserDto);
    return newUser;
  }

  // 회원 최신 정보 Repository에 저장하기
  async saveUser(user: UsersEntity): Promise<UsersEntity> {
    return this.usersRepository.save(user);
  }

  // 이메일로 회원 찾기
  async findUserByEmail(email: string): Promise<UsersEntity | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // 회원 ID로 회원 찾기
  async findUserByUserId(userId: number): Promise<UsersEntity | undefined> {
    return this.usersRepository.findOne({ where: { userId } });
  }

  // 회원 실명과 휴대폰 번호로 회원 찾기
  async findUserByUsernameAndPhone(username: string, phoneNumber: string): Promise<UsersEntity | undefined> {
    return this.usersRepository.findOne({ where: { username, phoneNumber } });
  }

  // 회원 실명과 이메일로 회원 찾기
  async findUserByUsernameAndEmail(username: string, email: string): Promise<UsersEntity | undefined> {
    return this.usersRepository.findOne({ where: { username, email } });
  }

  // 페이지네이션 회원 조회
  async findUsersWithDetails(page: number, limit: number = 10): Promise<[any[], number]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('user.comments', 'comments')
      .select([
        'user.userId', // 회원 ID (렌터링 X)
        'user.nickname', // 닉네임
        'user.email', // 이메일
        'COUNT(posts.id) AS postCount', // 게시물 수
        'COUNT(comments.id) AS commentCount', // 댓글 수
        'user.createdAt', // 가입날짜
      ])
      .groupBy('user.userId')
      .orderBy('user.createdAt', 'DESC') // 가입일 기준 내림차순 정렬
      .skip((page - 1) * limit)
      .take(limit);

    const [rawUsers, total] = await Promise.all([queryBuilder.getRawMany(), this.countTotalUsers()]);

    return [rawUsers, total];
  }

  // 전체 사용자 수 계산
  async countTotalUsers(): Promise<number> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .select('COUNT(user.userId)', 'total')
      .getRawOne();
    return Number(result.total);
  }

  // 승인 대기중, 승인 거절당한 회원 조회
  async findPendingAndRejectVerifications(page: number, limit: number = 10): Promise<[UsersEntity[], number]> {
    return this.usersRepository.findAndCount({
      where: [
        { membershipStatus: EMembershipStatus.PENDING_VERIFICATION, deletedAt: null },
        { rejected: false, deletedAt: null },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
