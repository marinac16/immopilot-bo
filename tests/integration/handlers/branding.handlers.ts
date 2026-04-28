import { http, HttpResponse } from "msw";

const BASE = "http://localhost:4000";

export const brandingHandlers = [
  http.get(`${BASE}/api/branding-config/:userId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { userId: params.userId, emailHeaderUrl: null, emailFooterUrl: null },
    });
  }),

  http.post(`${BASE}/api/branding-config/:userId`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { userId: params.userId, ...(body as object) },
    });
  }),
];
