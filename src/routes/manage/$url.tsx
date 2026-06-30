import {createFileRoute} from '@tanstack/react-router'
import * as z from 'zod'
import ms from "#/assets/ms.svg";
import {
    getShortLinkFullDataOwner,
    updateShortLink,
    updateShortLinkValidationSchema,
} from "#/functions/links.functions";
import {copyToClipboard} from "#/lib/clipboardUtil.ts";
import {
    Field,
    FieldDescription, FieldError,
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
import type {linksTable} from "#/db/schema.ts";
import {Checkbox} from "#/components/ui/checkbox.tsx";
import {Field as FieldComp, FieldGroup as FieldGroupComp} from "#/components/ui/field.tsx";
import {DatePicker} from "#/components/ui/date-picker.tsx";
import {PageTemplate} from "#/components/PageTemplate.tsx";

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

    const {data, isPending} = useQuery({
        queryKey: ['shortlink', shortLink],
        queryFn: async () => {
            return await getShortLinkFullDataOwner({data: {
                    shortUrl: shortLink,
                    ownerCode
                }})
        }
    }, queryClient)

    if (isPending) return <div>Loading...</div>

    if (!data || !data.success) {
        return <div className='text-red-400'>{data?.message ?? 'Unknown error'}</div>
    }

    const link = data.data
    return <ManageForm link={link} shortLink={shortLink} ownerCode={ownerCode}/>
}

const formSchema = updateShortLinkValidationSchema.refine(
    (val) => !val.expires || val.expiresAt !== undefined,
    { message: 'Please select an expiration date', path: ['expiresAt'] }
);

function ManageForm({link, shortLink, ownerCode}: {
    link: typeof linksTable.$inferSelect;
    shortLink: string;
    ownerCode: string;
}) {
    const queryClient = useQueryClient()

    const {mutateAsync: update} = useMutation({
        mutationFn: async (data: {
            shortUrl: string;
            ownerCode: string;
            alias?: string;
            longUrl: string;
            active: boolean;
            expires: boolean;
            expiresAt?: Date;
        }) => {
            return await updateShortLink({data})
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shortlink', shortLink]})
        }
    }, queryClient)

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm({
        defaultValues: {
            alias: link.alias || '',
            longUrl: link.longUrl,
            active: !!link.active,
            expires: !!link.expiresAt,
            expiresAt: link.expiresAt ? new Date(link.expiresAt) : undefined,
        } as FormValues,
        validators: {
            onSubmit: formSchema,
            onChange: formSchema,
        },
        onSubmit: async ({ value, formApi }) => {
            const result = await update({
                shortUrl: shortLink,
                ownerCode,
                alias: value.alias,
                longUrl: value.longUrl,
                active: value.active,
                expires: value.expires,
                expiresAt: value.expires ? value.expiresAt : undefined,
            });

            if (!result.success) {
                if (result.field) {
                    formApi.setFieldMeta(
                        result.field as keyof FormValues,
                        (meta) => ({
                            ...meta,
                            errors: [result.message],
                            errorMap: { ...meta.errorMap, onSubmit: result.message },
                        })
                    );
                } else {
                    throw new Error(result.message);
                }
            }
        }
    });

    return (
        <PageTemplate img={ms} imgAlt="Manage your link" imgPlacement="right">
            <h2 className='text-center my-3 text-3xl'>Manage your link</h2>
            {/*<p className='text-muted-foreground mb-4'>*/}
            {/*    You are managing the link <span className='font-bold'>{link.shortUrl}</span> with*/}
            {/*    the owner code <span className='font-bold'>{link.ownerCode}</span>. The link leads*/}
            {/*    to <span className='font-bold'>{link.longUrl}</span>.*/}
            {/*</p>*/}

            <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                {(submitError) => submitError ? (
                    <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm font-medium">
                        {submitError instanceof Error ? submitError.message : String(submitError)}
                    </div>
                ) : null}
            </form.Subscribe>

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
                                    <FieldError errors={field.state.meta.errors} />
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
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        </form.Field>

                        <form.Field name="active">
                            {(field) => (
                                <Field orientation='horizontal'>
                                    <FieldLabel htmlFor="enb">Enabled</FieldLabel>
                                    <Switch
                                        id="enb"
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </Field>
                            )}
                        </form.Field>

                        <form.Field name="expires">
                            {(field) => (
                                <FieldGroupComp>
                                    <FieldComp orientation="horizontal">
                                        <Checkbox
                                            id="link-expires"
                                            checked={field.state.value}
                                            onCheckedChange={(checked) => field.handleChange(!!checked)}
                                        />
                                        <FieldLabel htmlFor="link-expires">
                                            I want to set expiration date
                                        </FieldLabel>
                                    </FieldComp>
                                </FieldGroupComp>
                            )}
                        </form.Field>

                        <form.Subscribe selector={(state) => state.values.expires}>
                            {(expires) => expires && (
                                <form.Field name="expiresAt">
                                    {(field) => (
                                        <Field>
                                            <FieldLabel htmlFor="expires-at">Expiration date</FieldLabel>
                                            <DatePicker
                                                id="expires-at"
                                                value={field.state.value}
                                                onChange={(date) => field.handleChange(date)}
                                                // onBlur={field.handleBlur}
                                                placeholder="Pick an expiration date"
                                            />
                                            <FieldError errors={field.state.meta.errors} />
                                        </Field>
                                    )}
                                </form.Field>
                            )}
                        </form.Subscribe>

                        <ButtonGroup className='ml-auto mt-4'>
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
                                        {isSubmitting ? 'Applying...' : 'Apply changes'}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </ButtonGroup>
                    </FieldGroup>
                </FieldSet>
            </form>
        </PageTemplate>
    )
}