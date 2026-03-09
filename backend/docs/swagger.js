import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 5000;
const COOKIE_NAME = process.env.COOKIE_NAME || 'pitstopshop_token';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PitStopShop API',
      version: '1.0.0',
      description: 'OpenAPI (Swagger) dokumentacija za PitStopShop backend.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],

    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Orders', description: 'Order endpoints' },
      { name: 'TechReviews', description: 'Mechanic reviews endpoints' },
      { name: 'Admin', description: 'Admin analytics endpoints' },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: COOKIE_NAME,
        },
      },

      schemas: {
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },

        // ---------- AUTH ----------
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Jana Jovanović' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
            role: {
              type: 'string',
              enum: ['customer', 'mechanic'],
              example: 'customer',
            },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
          },
        },

        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            fullName: { type: 'string', example: 'Jana Jovanović' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            role: {
              type: 'string',
              enum: ['customer', 'mechanic', 'admin'],
              example: 'customer',
            },
            deliveryAddress: {
              type: 'string',
              nullable: true,
              example: 'Zemun, Beograd',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ---------- PRODUCTS ----------
        ProductImage: {
          type: 'object',
          properties: {
            publicId: {
              type: 'string',
              example: 'pitstopshop/products/abc123',
            },
            url: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../image.jpg',
            },
            secureUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../image.jpg',
            },
          },
        },

        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            name: { type: 'string', example: 'Brake Pads' },
            description: {
              type: 'string',
              example: 'High quality brake pads...',
            },
            price: { type: 'number', example: 49.99 },
            stock: { type: 'integer', example: 12 },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductImage' },
            },
            category: { type: 'string', example: 'Brakes' },
            isActive: { type: 'boolean', example: true },
            compatibility: {
              type: 'array',
              items: { type: 'string' },
              example: ['BMW 320d 2018', 'Audi A4 2016'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        ProductsListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 120 },
            totalPages: { type: 'integer', example: 10 },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
          },
        },

        // ---------- ORDERS ----------
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            price: { type: 'number', example: 49.99 },
            orderId: { type: 'integer', example: 100 },
            productId: { type: 'integer', example: 10 },
            product: { $ref: '#/components/schemas/Product' },
          },
        },

        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 100 },
            status: {
              type: 'string',
              enum: [
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
              ],
              example: 'pending',
            },
            address: { type: 'string', example: 'Zemun, Beograd' },
            totalAmount: { type: 'number', example: 129.98 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer', example: 1 },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
          },
        },

        CreateOrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            address: { type: 'string', example: 'Zemun, Beograd' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'integer', example: 10 },
                  quantity: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },

        OrdersListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 2 },
            orders: {
              type: 'array',
              items: { $ref: '#/components/schemas/Order' },
            },
          },
        },

        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: [
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
              ],
              example: 'cancelled',
            },
          },
        },

        // ---------- TECH REVIEWS ----------
        TechReview: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            text: {
              type: 'string',
              example: 'Good quality and correct installation.',
            },
            rating: { type: 'integer', example: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer', example: 2 },
            productId: { type: 'integer', example: 10 },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 2 },
                fullName: { type: 'string', example: 'Marko Mehaničar' },
                role: { type: 'string', example: 'mechanic' },
              },
            },
            product: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 10 },
                name: { type: 'string', example: 'Brake Pads' },
                category: { type: 'string', example: 'Brakes' },
              },
            },
          },
        },

        CreateTechReviewRequest: {
          type: 'object',
          required: ['productId', 'text', 'rating'],
          properties: {
            productId: { type: 'integer', example: 10 },
            text: { type: 'string', example: 'Solid part, fits perfectly.' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          },
        },

        UpdateTechReviewRequest: {
          type: 'object',
          properties: {
            text: { type: 'string', example: 'Updated review text...' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          },
        },

        TechReviewsListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 35 },
            totalPages: { type: 'integer', example: 4 },
            reviews: {
              type: 'array',
              items: { $ref: '#/components/schemas/TechReview' },
            },
          },
        },

        // ---------- ADMIN STATS ----------
        AdminStatsResponse: {
          type: 'object',
          properties: {
            kpis: {
              type: 'object',
              properties: {
                users: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 100 },
                    customers: { type: 'integer', example: 80 },
                    mechanics: { type: 'integer', example: 15 },
                    admins: { type: 'integer', example: 5 },
                  },
                },
                products: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 200 },
                    active: { type: 'integer', example: 180 },
                    lowStockActive: { type: 'integer', example: 7 },
                  },
                },
                orders: {
                  type: 'object',
                  properties: { total: { type: 'integer', example: 320 } },
                },
                reviews: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 90 },
                    avgRating: {
                      type: 'number',
                      nullable: true,
                      example: 4.25,
                    },
                  },
                },
                revenue: {
                  type: 'object',
                  properties: {
                    nonCancelledTotal: { type: 'number', example: 12500.5 },
                    deliveredTotal: { type: 'number', example: 9800.25 },
                    avgOrderValueNonCancelled: {
                      type: 'number',
                      example: 39.05,
                    },
                  },
                },
              },
            },
            charts: {
              type: 'object',
              properties: {
                ordersByStatus: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'pending' },
                      count: { type: 'integer', example: 10 },
                    },
                  },
                },
                revenueByMonth: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'string', example: '2026-02' },
                      revenue: { type: 'number', example: 1234.56 },
                    },
                  },
                },
                topProductsByQty: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      productId: { type: 'integer', example: 10 },
                      name: { type: 'string', example: 'Brake Pads' },
                      category: { type: 'string', example: 'Brakes' },
                      quantity: { type: 'integer', example: 45 },
                    },
                  },
                },
                productsByCategory: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string', example: 'Brakes' },
                      count: { type: 'integer', example: 35 },
                    },
                  },
                },
                ratingDistribution: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rating: { type: 'integer', example: 5 },
                      count: { type: 'integer', example: 20 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
