import {createFileRoute} from '@tanstack/react-router'
import * as z from 'zod'
import {Card} from "#/components/ui/card.tsx";
import wl from "#/assets/wl.svg";
import {Footer} from "#/components/Footer.tsx";
import {getLinkData} from "#/functions/links.ts";

export const Route = createFileRoute('/manage/$url')({
    component: RouteComponent,
    validateSearch: z.object({code: z.string()}),
    loaderDeps: ({ search }) => ({ code: search.code }),
    loader: async ({params, deps}) => {
        return await getLinkData({data: {shortUrl: params.url, ownerCode: deps.code}})
    },
})

function RouteComponent() {
    const link = Route.useLoaderData()

    // TODO: better error handling
    if (!link.success){
        return <div className='text-red-400'>{link.message}</div>
    }

    return <div className="p-8">
        <Card className="w-full max-w-5xl mx-auto p-6">
            <h1 className="text-4xl text-center mb-6"><span
                className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
            </h1>

            <div className="grid md:grid-cols-2 grid-cols-1">
                <main className='h-full'>
                    <h2 className='text-center my-3 text-3xl'>Manage your link</h2>
                    <p className='text-muted-foreground'>You are managing the link <span className='font-bold'>{link.data.shortUrl}</span> with the owner code <span className='font-bold'>{link.data.ownerCode}</span>. The link leads to <span className='font-bold'>{link.data.longUrl}</span>.</p>
                </main>
                <div className='hidden md:block'>
                    <img src={wl} alt="Woman typing on a laptop"/>
                </div>
            </div>

            <hr/>
            <Footer/>
        </Card>
    </div>
}
