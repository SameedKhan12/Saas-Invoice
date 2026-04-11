CREATE TYPE "public"."status" AS ENUM('draft', 'open', 'paid', 'overdue');--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "user_id" uuid NOT NULL;