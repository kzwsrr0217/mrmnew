// mrmnew/backend/src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(username: string, pass: string, role: UserRole): Promise<Omit<User, 'password'>> {
    const newUser = new User();
    newUser.username = username;
    newUser.password = pass;
    newUser.role = role;
    
    const savedUser = await this.usersRepository.save(newUser);
    return savedUser;
  }

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ username });
    return user || undefined;
  }

  // --- ÚJ METÓDUS ---
  async findOneById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ id });
    return user || undefined;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
        order: { username: 'ASC' }
    });
  }

  async updateUserRole(id: number, newRole: UserRole): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`A(z) ${id} azonosítójú felhasználó nem található.`);
    }
    user.role = newRole;
    return this.usersRepository.save(user);
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`A(z) ${id} azonosítójú felhasználó nem található.`);
    }
    
    user.password = newPassword; 
    await this.usersRepository.save(user);
  }

  async findOneWithPassword(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.username = :username", { username })
        .getOne();
    return user || undefined;
  }
}