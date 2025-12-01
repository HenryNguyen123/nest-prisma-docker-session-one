import { LoginRateLimitedGuard } from 'src/rate-limited/rate-limited.guard';

describe('RateLimitedGuard', () => {
  it('should be defined', () => {
    expect(new LoginRateLimitedGuard()).toBeDefined();
  });
});
