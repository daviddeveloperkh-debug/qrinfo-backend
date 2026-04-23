CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" integer DEFAULT 1,
	"login" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
CREATE TABLE "welder_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificates_name" text,
	"intro_statement" text,
	"theory_grade" varchar(50),
	"practice_grade" varchar(50),
	"qualification_details" text,
	"issuance_basis" text,
	"issuing_body" varchar(255),
	"city" varchar(100),
	"certificate_no" varchar(50),
	"issue_date" date,
	"expiry_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "login_idx" ON "users" USING btree ("login");