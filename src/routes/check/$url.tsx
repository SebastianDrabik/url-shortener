import {createFileRoute, Link} from '@tanstack/react-router'
import {getShortLinkInfo, type PublicLink} from "#/functions/links.functions";
import {PageTemplate} from "#/components/PageTemplate.tsx";
import manQuestionMark from '@/assets/mq.svg'
import womanRocket from '@/assets/wr.svg'
import {QRCodeSVG} from "qrcode.react";
import {getSiteUrl} from "#/lib/urlUtil.ts";

export const Route = createFileRoute('/check/$url')({
    component: RouteComponent,
    loader: async ({params} ) => {
        const l = await getShortLinkInfo({data: {shortUrl: params.url}})
        return l
    }
})

function RouteComponent() {
    const link = Route.useLoaderData()
    const {url: shortUrl} = Route.useParams()

    return <PageTemplate img={link.success ? womanRocket : manQuestionMark} imgAlt={link.success ? 'Man holding question mark sign' : 'Woman flying on a rocket'} imgPlacement='right'>

        {link.success ? <LinkInfo link={link.data} /> : <LinkInfoNotFound short={shortUrl} /> }

    </PageTemplate>
}

function LinkInfo({ link }: { link: PublicLink}) {
    return <div>
        <h2 className='text-2xl mb-2 text-center'>{getSiteUrl()}/<span className='text-accent-foreground font-bold text-3xl'>{link.shortUrl}</span></h2>
        <ul className='text-md list-disc pl-4'>
            <li><span className='text-muted-foreground'>Link status:</span> {link.active ? 'active' : 'inactive'}</li>
            <li><span className='text-muted-foreground'>Creation date:</span> {link.createdAt.toUTCString()}</li>
            {link.expiresAt && <li>Expiration date: {link.expiresAt.toUTCString()}</li>}
        </ul>

        <div className='flex justify-center mt-4'>
            <QRCodeSVG value={link.longUrl} level={'H'} size={200} fgColor="#1a1a1a" bgColor="#ffffff" imageSettings={{excavate: true, src: '/icon.svg', width: 50, height: 50}} />
        </div>
    </div>
}

function LinkInfoNotFound({short}: {short: string}) {
    return <div>
        <h2 className='text-2xl mb-2 text-center'>{getSiteUrl()}/<span className='text-accent-foreground font-bold text-3xl'>{short}</span></h2>
        <p className='text-muted-foreground text-xl' >The link is currently unavailable. Try again later or <Link to={'/'}>create a new one</Link>.</p>
    </div>
}