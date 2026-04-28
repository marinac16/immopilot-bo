import { http, HttpResponse } from "msw";

const BASE = "http://localhost:4000";

export const usersHandlers = [
  http.get(`${BASE}/api/user`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        users: [
          { id: "1", email: "agent@test.com", firstname: "Jean", lastname: "Dupont", status: "ACTIVE" },
          { id: "2", email: "agent2@test.com", firstname: "Marie", lastname: "Martin", status: "ACTIVE" },
        ],
        total: 2,
        limit: 100,
        offset: 0,
        hasMore: false,
      },
    });
  }),

  http.get(`${BASE}/api/user/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        email: "agent@test.com",
        firstname: "Jean",
        lastname: "Dupont",
        status: "ACTIVE",
      },
    });
  }),

  http.post(`${BASE}/api/user`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: { id: "new-1", ...(body as object) } }, { status: 201 });
  }),

  http.patch(`${BASE}/api/user/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        email: "agent@test.com",
        firstname: "Jean",
        lastname: "Dupont",
        status: "ACTIVE",
        ...(body as object),
      },
    });
  }),

  http.delete(`${BASE}/api/user/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
