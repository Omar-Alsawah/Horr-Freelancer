import { http, HttpResponse } from 'msw';
import { BASE_URL } from '../api/axios';

let mockServices = [
  {
    id: '1',
    title: 'I will design a modern web application',
    category: 'Design',
    price: 100,
    status: 'Approved',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    date: 'Oct 12, 2025'
  },
  {
    id: '2',
    title: 'I will build a fullstack React and Node.js application',
    category: 'Web Development',
    price: 500,
    status: 'Under review',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    date: 'Nov 01, 2025'
  }
];

export const handlers = [
  // Example mock for getJobs
  http.get(`${BASE_URL}/api/jobs/jobs`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          title: "Senior React Developer",
          description: "We are looking for a skilled React developer to build our frontend.",
          budget: "$5000",
          type: "Fixed Price"
        },
        {
          id: 2,
          title: "Fullstack .NET & React Engineer",
          description: "Need an engineer experienced in C# and React.",
          budget: "$40/hr",
          type: "Hourly"
        }
      ],
      totalCount: 2
    });
  }),

  // GET My Services
  http.get(`${BASE_URL}/api/services/my-services`, () => {
    return HttpResponse.json({
      data: mockServices,
      totalCount: mockServices.length
    });
  }),

  // POST Create Service
  http.post(`${BASE_URL}/api/services`, async ({ request }) => {
    const newService = await request.json();
    
    const serviceRecord = {
      ...newService,
      id: Date.now().toString(),
      status: 'Under review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    mockServices.push(serviceRecord);
    
    return HttpResponse.json(serviceRecord, { status: 201 });
  }),

  // DELETE Service
  http.delete(`${BASE_URL}/api/services/:id`, ({ params }) => {
    const { id } = params;
    mockServices = mockServices.filter(s => s.id !== id);
    return HttpResponse.json({ success: true });
  })
];
