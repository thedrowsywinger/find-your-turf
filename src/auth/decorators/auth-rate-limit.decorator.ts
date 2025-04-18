import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const AuthRateLimit = () => Throttle({ default: { ttl: 60, limit: 5 } });