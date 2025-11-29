CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workoutId` text NOT NULL,
	`name` text NOT NULL,
	`notes` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_sets` (
	`exercise_id` text NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`duration` integer NOT NULL
);
