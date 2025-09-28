import { Test, TestingModule } from '@nestjs/testing';
import { SystemPermitsService } from './system-permits.service';

describe('SystemPermitsService', () => {
  let service: SystemPermitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemPermitsService],
    }).compile();

    service = module.get<SystemPermitsService>(SystemPermitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
