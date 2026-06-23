import {createFileRoute} from '@tanstack/react-router'
import * as z from 'zod'
import {Card} from "#/components/ui/card.tsx";
import ms from "#/assets/ms.svg";
import {Footer} from "#/components/Footer.tsx";
import {getLinkData} from "#/functions/links.ts";
import {copyToClipboard} from "#/lib/clipboardUtil.ts";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet
} from "#/components/ui/field.tsx";
import {Input} from "#/components/ui/input.tsx";
import {ButtonGroup} from "#/components/ui/button-group.tsx";
import {Button} from "#/components/ui/button.tsx";

import {useQuery, useQueryClient} from '@tanstack/react-query'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from "#/components/ui/input-group";
import {Switch} from "#/components/ui/switch.tsx";

export const Route = createFileRoute('/manage/$url')({
    component: RouteComponent,
    validateSearch: z.object({ownerCode: z.string()}),
    head: () => ({
        meta: [
            {title: 'URL shortener - manage your link'},
        ]
    })
})

function RouteComponent() {
    const {url: shortLink} = Route.useParams()
    const {ownerCode} = Route.useSearch()

    const { error, data, isPending } = useQuery({
        queryKey: ['shortlink', shortLink],
        queryFn: async () => {
            return await getLinkData({ data: { shortUrl: shortLink, ownerCode } })
        }
    }, useQueryClient())

    if (isPending) return <div>Loading...</div>

    if (!data || !data.success) {
        return <div className='text-red-400'>{data?.message ?? 'Unknown error'}</div>
    }

// Now data.success is true, so data.data is the link row
    const link = data.data
    return <div className="p-8">
        <Card className="w-full max-w-5xl mx-auto p-6">
            <h1 className="text-4xl text-center mb-6"><span
                className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
            </h1>

            <div className="grid md:grid-cols-2 grid-cols-1">
                <div className='hidden md:block'>
                    <img src={ms} alt="Woman typing on a laptop"/>
                </div>
                <main className='h-full'>
                    <h2 className='text-center my-3 text-3xl'>Manage your link</h2>
                    <p className='text-muted-foreground'>You are managing the link <span
                        className='font-bold'>{link.shortUrl}</span> with the owner code <span
                        className='font-bold'>{link.ownerCode}</span>. The link leads to <span
                        className='font-bold'>{link.longUrl}</span>.</p>

                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="short">Generated short url</FieldLabel>
                                <ButtonGroup>
                                    <InputGroup>
                                        <InputGroupInput id="input-group-url" defaultValue={link.shortUrl} disabled />
                                        <InputGroupAddon>
                                            <InputGroupText>{window.location.origin}/</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <Button variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/${link.shortUrl}`)}>Copy</Button>
                                </ButtonGroup>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="alias">Your alias</FieldLabel>
                                <ButtonGroup>
                                    <InputGroup>
                                        <InputGroupInput id="alias" placeholder="awesome" />
                                        <InputGroupAddon>
                                            <InputGroupText>{window.location.origin}/</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {/*TODO: actual alias with state*/}
                                    <Button variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/${link.alias}`)}>Copy</Button>
                                </ButtonGroup>
                                <FieldDescription>You can set your own alias for the short link. Both, generated and alias will work.</FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="longurl">Redirect URL</FieldLabel>
                                <Input type='text' id='longurl' defaultValue={link.longUrl}></Input>
                            </Field>

                            <Field orientation='horizontal'>
                                <FieldLabel htmlFor="enb">Enabled</FieldLabel>
                                <Switch id='enb' ></Switch>
                            </Field>

                            <ButtonGroup className='ml-auto'>
                                <Button variant='outline' size='sm' onClick={() => {copyToClipboard(`${window.location.origin}/manage/${link.shortUrl}?code=${link.ownerCode}`)}}>Copy edit link</Button>
                                <Button disabled size='sm' >Apply changes</Button>
                            </ButtonGroup>
                        </FieldGroup>
                    </FieldSet>
                </main>
            </div>

            <hr/>
            <Footer/>
        </Card>
    </div>
}
