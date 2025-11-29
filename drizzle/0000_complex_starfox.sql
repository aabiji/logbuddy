CREATE TABLE `exercise_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`exerciseId` text NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`workoutId` text NOT NULL,
	`name` text NOT NULL,
	`notes` text NOT NULL,
	FOREIGN KEY (`workoutId`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`duration` integer NOT NULL
);
