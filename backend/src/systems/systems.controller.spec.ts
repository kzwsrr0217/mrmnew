import { Test, TestingModule } from '@nestjs/testing';
import { SystemsController } from './systems.controller';

describe('SystemsController', () => {
  let controller: SystemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemsController],
    }).compile();

    controller = module.get<SystemsController>(SystemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
