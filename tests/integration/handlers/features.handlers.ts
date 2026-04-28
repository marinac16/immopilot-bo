import { http, HttpResponse } from "msw";

const BASE = "http://localhost:4000";

export const featuresHandlers = [
  http.get(`${BASE}/api/features`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: "feat-1", name: "gmail_parser", description: null },
        { id: "feat-2", name: "gestion_leads", description: null },
      ],
    });
  }),
];
