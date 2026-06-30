import {createFileRoute} from '@tanstack/react-router'
import {getShortLinkInfo, type PublicLink} from "#/functions/links.functions";
import {PageTemplate} from "#/components/PageTemplate.tsx";
import manQuestionMark from '@/assets/mq.svg'
import womanRocket from '@/assets/wr.svg'

export const Route = createFileRoute('/check/$url')({
    component: RouteComponent,
    loader: async ({params} ) => {
        const l = await getShortLinkInfo({data: {shortUrl: params.url}})
        return l
    }
})

function RouteComponent() {
    const link = Route.useLoaderData()

    return <PageTemplate img={link.success ? womanRocket : manQuestionMark} imgAlt={link.success ? 'Man holding question mark sign' : 'Woman flying on a rocket'} imgPlacement='right'>

        {link.success ? <LinkInfo link={link.data} /> : <LinkInfoNotFound /> }

    </PageTemplate>
}

function LinkInfo({ link }: { link: PublicLink}) {
    return <div>
        <h2 className='text-2xl mb-2'>{location.origin}/<span className='text-accent-foreground font-bold text-3xl'>{link.shortUrl}</span></h2>
        <ul className='text-md list-disc pl-4'>
            <li>Link status: {link.active ? 'active' : 'inactive'}</li>
            <li>Creation date: {link.createdAt.toUTCString()}</li>
            {link.expiresAt && <li>Expiration date: {link.expiresAt.toUTCString()}</li>}
            <li>QR TODO</li>
        </ul>
    </div>
}

function LinkInfoNotFound() {
    return <div>
        <h2>{`${window.location.origin}/das`}</h2>
        <ul className='list-disc pl-4'>
            <li>Link status</li>
            <li>Creation date</li>
            <li>Expiration date</li>
            <li>QR</li>
        </ul>
    </div>
}