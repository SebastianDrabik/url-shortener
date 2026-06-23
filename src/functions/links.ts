import {createServerFn} from "@tanstack/react-start";
import * as z from "zod";
import {randomString} from "#/lib/random.ts";

import {db} from '#/db'
import {linksTable} from "#/db/schema.ts";
import {eq} from "drizzle-orm";

export const createShortLink = createServerFn({method: 'POST'})
    .validator(z.object({
        longUrl: z.url(),
        expiresAt: z.date().min(new Date()).optional(),
    }))
    .handler((r): ({success: false} | {success: true, generatedShort: string, ownerCode: string}) => {
        const shortUrl = randomString(6).toUpperCase();
        const ownerCode = randomString(16);

        const res = db.insert(linksTable).values({
            shortUrl,
            longUrl: r.data.longUrl,
            expiresAt: r.data.expiresAt ? new Date(r.data.expiresAt) : null,
            ownerCode
        }).run();

        const success = res.changes > 0

        if (!success) {
            return {
                success: false
            }
        }
        return {
            success: true,
            generatedShort: shortUrl,
            ownerCode: ownerCode
        }
    });

export const getLinkData = createServerFn({method: 'POST'})
    .validator(z.object({
        shortUrl: z.string(),
        ownerCode: z.string(),
    })).handler(async (r): Promise<{success: false, message: string} | {success: true, data: typeof linksTable.$inferSelect}> => {
        const linkData = await db.select().from(linksTable).where(eq(linksTable.shortUrl, r.data.shortUrl));

        if (linkData.length === 0) {
            return {
                success: false,
                message: 'Link does not exist'
            }
        }

        const userLink = linkData[0]

        if (userLink.ownerCode !== r.data.ownerCode) {
            return {
                success: false,
                message: 'Owner code is not valid'
            }
        }

        return {
            success: true,
            data: userLink
        }
    })

export const getRedirectLink = createServerFn({method: 'POST'})
    .validator(z.object({
        shortUrl: z.string()
    }))
    .handler(async (r): Promise<{success: false, message: string} | {success: true, redirect: string}> => {
        const linkData = await db.select().from(linksTable).where(eq(linksTable.shortUrl, r.data.shortUrl));

        if (linkData.length === 0)
            return {success: false, message: 'Link does not exist'};

        const userLink = linkData[0]

        if (userLink.expiresAt && (new Date()) > userLink.expiresAt)
            return {success: false, message: 'Link has expired'};

        if (!userLink.active)
            return {success: false, message: 'Link is not active'};

        return {
            success: true,
            redirect: userLink.longUrl
        }
    })