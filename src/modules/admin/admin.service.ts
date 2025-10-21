import { AdminUsersRepository } from './entities/admin-users.entity';
import { AllowedAdminsRepository } from './entities/allowed-admins.entity';

export class AdminService {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly allowedAdminsRepository: AllowedAdminsRepository,
  ) {}

  findOne(id: string) {
    return this.adminUsersRepository.findOneBy({ id });
  }
}
