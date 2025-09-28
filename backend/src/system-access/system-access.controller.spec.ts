import { Test, TestingModule } from '@nestjs/testing';
import { SystemAccessController } from './system-access.controller';

describe('SystemAccessController', () => {
  let controller: SystemAccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemAccessController],
    }).compile();

    controller = module.get<SystemAccessController>(SystemAccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
