import { http, HttpResponse } from "msw";

const BASE = "http://localhost:4000";

export const notionHandlers = [
  http.get(`${BASE}/api/notion-config/:userId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        userId: params.userId,
        notionToken: null,
        notionParentPageId: null,
        leadsAcquereurs: null,
        visites: null,
        biens: null,
        relances: null,
        equipe: null,
        contacts: null,
        taches: null,
        templateMessages: null,
        promptAgentAjouterTache: null,
      },
    });
  }),

  http.put(`${BASE}/api/notion-config/:userId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { userId: params.userId, ...body },
    });
  }),
];
