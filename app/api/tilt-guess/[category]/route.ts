import { proxyGameApiRequest } from '@/lib/gameApiProxy';

interface CategoryRouteContext {
  params: Promise<{ category: string }>;
}

export async function GET(request: Request, context: CategoryRouteContext) {
  const params = await context.params;
  return proxyGameApiRequest(`/api/tilt-guess/${params.category}`, request);
}
