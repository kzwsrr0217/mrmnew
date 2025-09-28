import { Test, TestingModule } from '@nestjs/testing';
import { DataHandlingPermitsService } from './data-handling-permits.service';

describe('DataHandlingPermitsService', () => {
  let service: DataHandlingPermitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataHandlingPermitsService],
    }).compile();

    service = module.get<DataHandlingPermitsService>(DataHandlingPermitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
