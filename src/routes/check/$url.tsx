import {createFileRoute} from '@tanstack/react-router'
import {getRedirectLink} from "#/functions/links.ts";
import {PageTemplate} from "#/components/PageTemplate.tsx";
import manQuestionMark from '@/assets/mq.svg'
import womanRocket from '@/assets/wr.svg'

export const Route = createFileRoute('/check/$url')({
    component: RouteComponent,
    loader: async ({params} ) => {
        const l = await getRedirectLink({data: {shortUrl: params.url}})
        return l
    }
})

function RouteComponent() {
    const link = Route.useLoaderData()

    return <PageTemplate img={link.success ? womanRocket : manQuestionMark} imgAlt={link.success ? 'Man holding question mark sign' : 'Woman flying on a rocket'} imgPlacement='right'>
        <h1>TODO!</h1>
        <ul className='list-disc pl-4'>
            <li>Link status</li>
            <li>Creation date</li>
            <li>Expiration date</li>
            <li>QR</li>
        </ul>

    </PageTemplate>
}
