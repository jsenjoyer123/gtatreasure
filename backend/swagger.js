const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Документация API для проекта',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Аутентификация и регистрация'
            },
            {
                name: 'Products',
                description: 'Операции с товарами'
            },
            {
                name: 'Wholesale',
                description: 'Операции с оптовыми товарами'
            }
        ],
        paths: {
            '/api/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Авторизация пользователя',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginRequest'
                                },
                                examples: {
                                    success: {
                                        summary: 'Пример успешного запроса',
                                        value: {
                                            email: "test@example.com",
                                            password: "password123"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Успешная авторизация',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthResponse'
                                    },
                                    examples: {
                                        success: {
                                            summary: 'Успешный ответ',
                                            value: {
                                                message: "Авторизация успешна",
                                                user: {
                                                    id: 1,
                                                    email: "test@example.com"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Ошибка авторизации',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ErrorResponse'
                                    },
                                    examples: {
                                        error: {
                                            summary: 'Неверные учетные данные',
                                            value: {
                                                message: "Неверные учетные данные"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Регистрация пользователя',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/RegisterRequest'
                                },
                                examples: {
                                    success: {
                                        summary: 'Пример запроса регистрации',
                                        value: {
                                            email: "new_user@example.com",
                                            password: "securepassword123"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Пользователь успешно зарегистрирован',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/RegisterResponse'
                                    },
                                    examples: {
                                        success: {
                                            summary: 'Успешная регистрация',
                                            value: {
                                                message: "Регистрация успешна",
                                                user: {
                                                    id: 10,
                                                    email: "new_user@example.com"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Некорректные данные',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ErrorResponse'
                                    },
                                    examples: {
                                        error: {
                                            summary: 'Ошибка валидации',
                                            value: {
                                                message: "Пароль должен быть не менее 6 символов"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        409: {
                            description: 'Пользователь уже существует',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ErrorResponse'
                                    },
                                    examples: {
                                        error: {
                                            summary: 'Ошибка регистрации',
                                            value: {
                                                message: "Пользователь уже существует"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/verify': {
                post: {
                    tags: ['Auth'],
                    summary: 'Верификация пользователя (например, по email или токену)',
                    security: [{
                        bearerAuth: []
                    }],
                    responses: {
                        200: {
                            description: 'Успешная верификация',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/VerifyResponse'
                                    },
                                    examples: {
                                        success: {
                                            summary: 'Успешная верификация',
                                            value: {
                                                message: "Почта успешно подтверждена",
                                                user: {
                                                    id: 1,
                                                    email: "test@example.com",
                                                    isVerified: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Токен недействителен',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ErrorResponse'
                                    },
                                    examples: {
                                        error: {
                                            summary: 'Ошибка верификации',
                                            value: {
                                                message: "Недействительный токен"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // ... остальные пути (products, wholesale) без изменений ...
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        password: {
                            type: 'string',
                            example: 'password123',
                            minLength: 6
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'new_user@example.com'
                        },
                        password: {
                            type: 'string',
                            example: 'securepassword123',
                            minLength: 6
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Авторизация успешна'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        }
                    }
                },
                RegisterResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Регистрация успешна'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },
                VerifyResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Почта успешно подтверждена'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        email: {
                            type: 'string',
                            example: 'test@example.com'
                        },
                        isVerified: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Произошла ошибка'
                        }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, 'server.js'),
        path.join(__dirname, 'productsRoutes.js'),
        path.join(__dirname, 'wholesaleProductsRoutes.js')
    ]
};

module.exports = swaggerJsdoc(options);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получение списка всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

