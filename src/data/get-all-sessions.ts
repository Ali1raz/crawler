import { auth, authMiddleware } from '#/lib/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import z from 'zod';

export const listAllSessions = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .handler(async () => {
        const sessions = await auth.api.listSessions({
            headers: getRequestHeaders(),
        });

        return sessions;
    });

export const revokeSingleSession = createServerFn({ method: 'POST' })
    .inputValidator(
        z.object({
            token: z.string().min(1),
        }),
    )
    .handler(async ({ data }) => {
        await auth.api.revokeSession({
            headers: getRequestHeaders(),
            body: { token: data.token },
        });

        return { success: true };
    });