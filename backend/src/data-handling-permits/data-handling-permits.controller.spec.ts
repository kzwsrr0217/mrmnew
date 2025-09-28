import { Test, TestingModule } from '@nestjs/testing';
import { DataHandlingPermitsController } from './data-handling-permits.controller';

describe('DataHandlingPermitsController', () => {
  let controller: DataHandlingPermitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataHandlingPermitsController],
    }).compile();

    controller = module.get<DataHandlingPermitsController>(DataHandlingPermitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
