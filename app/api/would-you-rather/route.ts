import { proxyGameApiRequest } from '@/lib/gameApiProxy';

export async function GET(request: Request) {
  return proxyGameApiRequest('/api/would-you-rather', request);
}
