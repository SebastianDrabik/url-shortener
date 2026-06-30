import {createServerFn} from "@tanstack/react-start";
import * as z from "zod";
import {randomString} from "#/lib/random.ts";

import {db} from '#/db'
import {linksTable} from "#/db/schema.ts";
import {and, eq, ne, or} from "drizzle-orm";

type ServerResponse<T> = { success: true, data: T } | { success: false, message?: string };

type ServerFormResponse<T> =
    | { success: true, data: T }
    | { success: false, message?: string, field?: string };

export const createShortLink = createServerFn({method: 'POST'})
    .validator(z.object({
        longUrl: z.string().url(),
        expiresAt: z.date().min(new Date()).optional(),
    }))
    .handler((r): ServerResponse<{ generatedShort: string, ownerCode: string }> => {
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
            data: {
                generatedShort: shortUrl,
                ownerCode: ownerCode
            }
        }
    });

export type PublicLink = Omit<typeof linksTable.$inferSelect, 'ownerCode'>

export const getShortLinkInfo = createServerFn({method: 'POST'})
    .validator(z.object({
        shortUrl: z.string()
    }))
    .handler(async (r): Promise<ServerResponse<PublicLink>> => {
        const linkData = await db.select().from(linksTable).where(or(eq(linksTable.shortUrl, r.data.shortUrl), eq(linksTable.alias, r.data.shortUrl)));

        if (linkData.length === 0)
            return {success: false, message: 'Link does not exist'};

        const userLink = linkData[0]

        if (userLink.expiresAt && (new Date()) > userLink.expiresAt)
            return {success: false, message: 'Link has expired'};

        if (!userLink.active)
            return {success: false, message: 'Link is not active'};

        const {ownerCode, ...publicLink} = userLink

        return {
            success: true,
            data: publicLink
        }
    })

export const getShortLinkFullDataOwner = createServerFn({method: 'POST'})
    .validator(z.object({
        shortUrl: z.string(),
        ownerCode: z.string()
    }))
    .handler(async (r): Promise<ServerResponse<typeof linksTable.$inferSelect>> => {
        const linkData = await db.select().from(linksTable).where(or(eq(linksTable.shortUrl, r.data.shortUrl), eq(linksTable.alias, r.data.shortUrl)));

        if (linkData.length === 0)
            return {success: false, message: 'Link does not exist'};

        const userLink = linkData[0]

        if (userLink.ownerCode !== r.data.ownerCode)
            return {success: false, message: 'Owner code is not valid'};

        return {success: true, data: userLink}
    })

export const updateShortLinkValidationSchema = z.object({
    shortUrl: z.string(),
    ownerCode: z.string().length(25),
    alias: z.string().min(4).max(10).regex(/^[A-Za-z0-9_-]+$/g, {message: "Alias can only use alphanumeric characters, _ and -"}).optional(),
    longUrl: z.string().url(),
    expires: z.boolean(),
    expiresAt: z.date().min(new Date(), {message: "The date must be in the future"}).optional(),
    active: z.boolean(),
})

export const updateShortLink = createServerFn({method: 'POST'})
    .validator(updateShortLinkValidationSchema)
    .handler(async (r): Promise<ServerFormResponse<null>> => {
        const linkData = await db.select().from(linksTable).where(eq(linksTable.shortUrl, r.data.shortUrl));

        if (linkData.length === 0)
            return {success: false, message: 'Link does not exist'};

        const link = linkData[0];

        if (link.ownerCode !== r.data.ownerCode)
            return {success: false, message: 'Owner code is not valid'};

        if (r.data.alias) {
            const conflictingAlias = await db.select().from(linksTable).where(
                and(
                    eq(linksTable.alias, r.data.alias),
                    ne(linksTable.shortUrl, r.data.shortUrl)
                )
            );
            if (conflictingAlias.length > 0)
                return {success: false, message: 'This alias is already taken', field: 'alias'};
        }

        const updateRes = await db.update(linksTable).set({
            longUrl: r.data.longUrl,
            alias: r.data.alias,
            expiresAt: r.data.expires ? r.data.expiresAt : null,
            active: r.data.active
        }).where(eq(linksTable.shortUrl, r.data.shortUrl));

        if (updateRes.changes > 0)
            return {success: true, data: null};

        return {success: false, message: 'An error occured. Please try again later.'};
    })