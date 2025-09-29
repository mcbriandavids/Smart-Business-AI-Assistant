import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  Language,
  NotificationChannel,
  NotificationType,
} from "./notification.entity";

@Entity("notification_templates")
export class NotificationTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  templateKey: string;

  @Column()
  name: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: "json",
  })
  channels: NotificationChannel[];

  @Column({
    type: "json",
  })
  translations: {
    [key in Language]?: {
      title: string;
      message: string;
    };
  };

  @Column({ type: "json", nullable: true })
  variables?: string[];

  @Column({ type: "json", nullable: true })
  defaultMetadata?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
