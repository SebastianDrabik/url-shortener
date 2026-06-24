import {createFileRoute} from '@tanstack/react-router'
import * as z from 'zod'
import {Card} from "#/components/ui/card.tsx";
import ms from "#/assets/ms.svg";
import {Footer} from "#/components/Footer.tsx";
import {getLinkData, } from "#/functions/links.ts";
import {copyToClipboard} from "#/lib/clipboardUtil.ts";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet
} from "#/components/ui/field.tsx";
import {Input} from "#/components/ui/input.tsx";
import {ButtonGroup} from "#/components/ui/button-group.tsx";
import {Button} from "#/components/ui/button.tsx";
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from "#/components/ui/input-group";
import {Switch} from "#/components/ui/switch.tsx";
import {useForm} from "@tanstack/react-form-start";
import {linksTable} from "#/db/schema.ts";

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
    const queryClient = useQueryClient()

    const {error, data, isPending} = useQuery({
        queryKey: ['shortlink', shortLink],
        queryFn: async () => {
            return await getLinkData({data: {shortUrl: shortLink, ownerCode}})
        }
    }, queryClient)

    if (isPending) return <div>Loading...</div>

    if (!data || !data.success) {
        return <div className='text-red-400'>{data?.message ?? 'Unknown error'}</div>
    }

    const link = data.data
    return <ManageForm link={link} shortLink={shortLink} ownerCode={ownerCode}/>
}

function ManageForm({link, shortLink, ownerCode}: {
    link: typeof linksTable.$inferSelect;
    shortLink: string;
    ownerCode: string;
}) {
    const queryClient = useQueryClient()

    const {mutateAsync: update} = useMutation({
        mutationFn: async (data: { alias?: string; longUrl: string; active: boolean }) => {
            // return await updateShortLink({data: {shortUrl: shortLink, ownerCode, ...data}})
            return
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shortlink', shortLink]})
        }
    }, queryClient)

    const form = useForm({
        defaultValues: {
            alias: link.alias ?? '',
            longUrl: link.longUrl,
            active: link.active,
        },
        validators: {
            onSubmit: z.object({
                alias: z.string().optional(),
                longUrl: z.url(),
                active: z.boolean(),
            })
        },
        onSubmit: async ({value}) => {
            await update({
                alias: value.alias || undefined,
                longUrl: value.longUrl,
                active: !!value.active,
            })
        }
    })

    return (
        <div className="p-8">
            <Card className="w-full max-w-5xl mx-auto p-6">
                <h1 className="text-4xl text-center mb-6">
                    <span className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
                </h1>

                <div className="grid md:grid-cols-2 grid-cols-1">
                    <div className='hidden md:block'>
                        <img src={ms} alt="Man adjusting settings"/>
                    </div>
                    <main className='h-full'>
                        <h2 className='text-center my-3 text-3xl'>Manage your link</h2>
                        <p className='text-muted-foreground'>
                            You are managing the link <span className='font-bold'>{link.shortUrl}</span> with
                            the owner code <span className='font-bold'>{link.ownerCode}</span>. The link leads
                            to <span className='font-bold'>{link.longUrl}</span>.
                        </p>

                        <form onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}>
                            <FieldSet>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="short">Generated short url</FieldLabel>
                                        <ButtonGroup>
                                            <InputGroup>
                                                <InputGroupAddon>
                                                    <InputGroupText>{window.location.origin}/</InputGroupText>
                                                </InputGroupAddon>
                                                <InputGroupInput id="short" defaultValue={link.shortUrl} disabled/>
                                            </InputGroup>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => copyToClipboard(`${window.location.origin}/${link.shortUrl}`)}
                                            >
                                                Copy
                                            </Button>
                                        </ButtonGroup>
                                    </Field>

                                    <form.Field name="alias">
                                        {(field) => (
                                            <Field>
                                                <FieldLabel htmlFor="alias">Your alias</FieldLabel>
                                                <ButtonGroup>
                                                    <InputGroup>
                                                        <InputGroupAddon>
                                                            <InputGroupText>{window.location.origin}/</InputGroupText>
                                                        </InputGroupAddon>
                                                        <InputGroupInput
                                                            id="alias"
                                                            placeholder="awesome"
                                                            value={field.state.value}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            onBlur={field.handleBlur}
                                                        />
                                                    </InputGroup>
                                                    <form.Subscribe selector={(state) => state.values.alias}>
                                                        {(alias) => (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => copyToClipboard(`${window.location.origin}/${alias || link.shortUrl}`)}
                                                            >
                                                                Copy
                                                            </Button>
                                                        )}
                                                    </form.Subscribe>
                                                </ButtonGroup>
                                                <FieldDescription>
                                                    You can set your own alias for the short link. Both the generated
                                                    URL and alias will work.
                                                </FieldDescription>
                                            </Field>
                                        )}
                                    </form.Field>

                                    <form.Field name="longUrl">
                                        {(field) => (
                                            <Field>
                                                <FieldLabel htmlFor="longurl">Redirect URL</FieldLabel>
                                                <Input
                                                    type="text"
                                                    id="longurl"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                />
                                                {field.state.meta.errors.length > 0 && (
                                                    <p className="text-destructive text-sm">
                                                        {field.state.meta.errors[0]}
                                                    </p>
                                                )}
                                            </Field>
                                        )}
                                    </form.Field>

                                    <form.Field name="active">
                                        {(field) => (
                                            <Field orientation='horizontal'>
                                                <FieldLabel htmlFor="enb">Enabled</FieldLabel>
                                                <Switch
                                                    id="enb"
                                                    checked={!!field.state.value}
                                                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                                                />
                                            </Field>
                                        )}
                                    </form.Field>

                                    <ButtonGroup className='ml-auto'>
                                        <Button
                                            type="button"
                                            variant='outline'
                                            size='sm'
                                            onClick={() => copyToClipboard(`${window.location.origin}/manage/${link.shortUrl}?ownerCode=${link.ownerCode}`)}
                                        >
                                            Copy edit link
                                        </Button>
                                        <form.Subscribe selector={(state) => ({
                                            isSubmitting: state.isSubmitting,
                                            isDirty: state.isDirty,
                                        })}>
                                            {({isSubmitting, isDirty}) => (
                                                <Button
                                                    type="submit"
                                                    size='sm'
                                                    disabled={isSubmitting || !isDirty}
                                                >
                                                    Apply changes
                                                </Button>
                                            )}
                                        </form.Subscribe>
                                    </ButtonGroup>
                                </FieldGroup>
                            </FieldSet>
                        </form>
                    </main>
                </div>

                <hr/>
                <Footer/>
            </Card>
        </div>
    )
}