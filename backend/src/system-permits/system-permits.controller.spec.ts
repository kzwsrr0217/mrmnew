import { Test, TestingModule } from '@nestjs/testing';
import { SystemPermitsController } from './system-permits.controller';

describe('SystemPermitsController', () => {
  let controller: SystemPermitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemPermitsController],
    }).compile();

    controller = module.get<SystemPermitsController>(SystemPermitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
