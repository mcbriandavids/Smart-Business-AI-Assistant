import { Module } from "@nestjs/common";
// import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { ProductsModule } from "./modules/products/products.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AIModule } from "./modules/ai/ai.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { WebSocketModule } from "./modules/websocket/websocket.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET", "wife-business-ai-secret-key"),
        signOptions: { expiresIn: "24h" },
      }),
      inject: [ConfigService],
      global: true,
    }),

    // Passport
    PassportModule.register({ defaultStrategy: "jwt" }),

    // Feature modules
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    NotificationsModule,
    AIModule,
    AnalyticsModule,
    DeliveryModule,
    InventoryModule,
    WebSocketModule,
  ],
})
export class AppModule {}
