import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(), role: text("role", {enum: ["student", "staff", "admin"]}).notNull(),
  department: text("department").notNull(), createdAt: integer("created_at").notNull(),
});
export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(), userId: text("user_id").notNull().references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
}, t => [index("sessions_user_idx").on(t.userId)]);
export const complaints = sqliteTable("complaints", {
  id: text("id").primaryKey(), title: text("title").notNull(), description: text("description").notNull(),
  category: text("category").notNull(), location: text("location").notNull(), priority: text("priority").notNull(),
  status: text("status").notNull().default("Open"), studentId: text("student_id").notNull().references(() => users.id),
  assigneeId: text("assignee_id").references(() => users.id), createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(), resolvedAt: integer("resolved_at"), revision: integer("revision").notNull().default(1),
}, t => [index("complaints_student_idx").on(t.studentId), index("complaints_assignee_idx").on(t.assigneeId)]);
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(), complaintId: text("complaint_id").notNull().references(() => complaints.id),
  authorId: text("author_id").notNull().references(() => users.id), body: text("body").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("comments_complaint_idx").on(t.complaintId)]);
export const events = sqliteTable("events", {
  id: text("id").primaryKey(), complaintId: text("complaint_id").notNull().references(() => complaints.id),
  actorId: text("actor_id").notNull().references(() => users.id), message: text("message").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("events_complaint_idx").on(t.complaintId)]);
export const settings = sqliteTable("settings", { key: text("key").primaryKey(), value: text("value").notNull() });
export const loginAttempts = sqliteTable("login_attempts", {
  key: text("key").primaryKey(), count: integer("count").notNull(), expiresAt: integer("expires_at").notNull(),
});
