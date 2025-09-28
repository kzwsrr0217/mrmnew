import { Test, TestingModule } from '@nestjs/testing';
import { SystemAccessService } from './system-access.service';

describe('SystemAccessService', () => {
  let service: SystemAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemAccessService],
    }).compile();

    service = module.get<SystemAccessService>(SystemAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
