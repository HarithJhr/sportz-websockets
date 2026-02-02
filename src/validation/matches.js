import { z } from 'zod';

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// List matches query schema - validates optional limit as coerced positive integer (max 100)
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Match ID parameter schema - validates required id as coerced positive integer
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema with ISO date validation and chronological ordering
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport is required'),
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),
    startTime: z.string(),
    endTime: z.string(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .refine(
    (data) => {
      try {
        new Date(data.startTime).toISOString();
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'startTime must be a valid ISO date string',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => {
      try {
        new Date(data.endTime).toISOString();
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'endTime must be a valid ISO date string',
      path: ['endTime'],
    }
  )
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be chronologically after startTime',
        path: ['endTime'],
      });
    }
  });

// Update score schema - requires homeScore and awayScore as coerced non-negative integers
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
