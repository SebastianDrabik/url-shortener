import {createFileRoute} from '@tanstack/react-router'
import {Button} from "#/components/ui/button.tsx";
import {Card} from "#/components/ui/card.tsx";
import {Input} from "#/components/ui/input.tsx";

import wl from "#/assets/wl.svg"
import {Label} from "#/components/ui/label.tsx";
import {Checkbox} from "#/components/ui/checkbox.tsx";
import {Field, FieldError, FieldGroup, FieldLabel} from "#/components/ui/field.tsx";
import {Footer} from "#/components/Footer.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {createShortLink} from "#/functions/links.ts";
import {Spinner} from "#/components/ui/spinner.tsx";
import {useForm} from "@tanstack/react-form-start";
import {z} from 'zod'

export const Route = createFileRoute('/')({
    component: Home,
    head: () => ({
        meta: [
            {title: 'URL shortener - shorten a link'},
        ]
    })
})

const formSchema = z.object({
    linkExpires: z.boolean(),
    longUrl: z.string().url(),
    expiration: z.date().min(new Date(), {message: 'Expiration date must be in the future'}),
})

function Home() {
    const navigate = Route.useNavigate();

    const form = useForm({
        defaultValues: {
            linkExpires: false,
            longUrl: '',
            expiration: new Date(),
        },
        validators: {
            onSubmit: formSchema
        },
        onSubmit: async ({value}) => {
            const data = await shorten({
                longUrl: value.longUrl,
                expiresAt: value.linkExpires ? value.expiration : undefined,
            });
            if (data.success) {
                navigate({
                    to: '/manage/$url',
                    search: {ownerCode: data.ownerCode},
                    params: {url: data.generatedShort},
                });
            }
        }
    });

    const {mutateAsync: shorten, isPending} = useMutation({
        mutationFn: async (data: {longUrl: string; expiresAt?: Date}) => {
            return await createShortLink({data});
        },
    }, useQueryClient())

    return (
        <div className="p-8">
            <Card className="w-full max-w-5xl mx-auto p-6">
                <h1 className="text-4xl text-center mb-6">
                    <span className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
                </h1>

                <div className="grid md:grid-cols-2 grid-cols-1">
                    <main className='h-full'>
                        <h2 className='text-center my-3 text-3xl'>
                            Shorten. <span className='text-accent-foreground'>Share.</span> Manage.
                        </h2>
                        <p className='text-muted-foreground'>
                            This tools allows you to create short and manageble links to share with your
                            friends, coworkers or classmates.
                        </p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}>
                            <form.Field name="longUrl">
                                {(field) => (
                                    <>
                                        <Label htmlFor="long-url" className="mb-2">Your long url</Label>
                                        <Input
                                            id="long-url"
                                            placeholder="https://www.google.com/search?q=sdra..."
                                            className="w-full mb-1"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-destructive text-sm mb-3">
                                                {field.state.meta.errors[0]?.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            </form.Field>

                            <form.Field name="linkExpires">
                                {(field) => (
                                    <FieldGroup className='mb-2'>
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="terms-checkbox-basic"
                                                name="terms-checkbox-basic"
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => field.handleChange(!!checked)}
                                            />
                                            <FieldLabel htmlFor="terms-checkbox-basic">
                                                I want to set expiration date
                                            </FieldLabel>
                                        </Field>
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Subscribe selector={(state) => state.values.linkExpires}>
                                {(linkExpires) => linkExpires && (
                                    <form.Field name="expiration">
                                        {(field) => (
                                            <div className='p-2'>
                                                <Label htmlFor="expiration-date" className="mb-2">
                                                    Expiration date
                                                </Label>
                                                <Input
                                                    type='date'
                                                    id='expiration-date'
                                                    className="w-full mb-4"
                                                    value={field.state.value.toISOString().split('T')[0]}
                                                    onChange={(e) => field.handleChange(new Date(e.target.value))}
                                                    onBlur={field.handleBlur}
                                                />
                                                <FieldError errors={field.state.meta.errors} className="text-destructive text-sm mb-3"/>
                                            </div>
                                        )}
                                    </form.Field>
                                )}
                            </form.Subscribe>

                            <form.Subscribe selector={(state) => state.isSubmitting}>
                                {(isSubmitting) => (
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isPending || isSubmitting}
                                    >
                                        {(isPending || isSubmitting) && <Spinner data-icon="inline-start"/>}
                                        Shorten
                                    </Button>
                                )}
                            </form.Subscribe>
                        </form>
                    </main>
                    <div className='hidden md:block'>
                        <img src={wl} alt="Woman typing on a laptop"/>
                    </div>
                </div>
                <hr/>
                <Footer/>
            </Card>
        </div>
    )
}