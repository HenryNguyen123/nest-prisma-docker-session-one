import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitedService } from './rate-limited.service';

describe('RateLimitedService', () => {
  let service: RateLimitedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitedService],
    }).compile();

    service = module.get<RateLimitedService>(RateLimitedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
