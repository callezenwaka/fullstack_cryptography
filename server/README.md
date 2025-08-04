# Backend

## Run the Tests
```bash
npm test                    # Your go-to for running all tests
npm run test:watch         # During development - auto-runs tests as you code
npm run test:coverage      # Before commits/PRs to check coverage
# When working on a specific service
npm test test/services/userService.test.ts
# When working on all service tests
npm test test/services/
# When debugging a specific test
npm test -- --testNamePattern="getUserById"
```