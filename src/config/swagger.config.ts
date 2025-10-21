import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function initSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('drynest-core APIs')
    .setDescription('APIs for the drynest-core service.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Apply security to endpoints that are not public
  const paths = document.paths;
  Object.keys(paths).forEach((path) => {
    Object.keys(paths[path]).forEach((method) => {
      const operation = paths[path][method] as { security?: any[] };
      const publicControllers = ['app']; // @Public() controller
      const isPublicEndpoint = isPublicPath(path, publicControllers);
      if (operation && !isPublicEndpoint)
        operation.security = [{ bearerAuth: [] }];
    });
  });

  SwaggerModule.setup('api/v1/docs', app, document);
}

function isPublicPath(path: string, publicControllers: string[]) {
  return publicControllers.some((controller) => path.includes(controller));
}
