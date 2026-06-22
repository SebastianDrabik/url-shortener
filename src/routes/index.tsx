import {createFileRoute} from '@tanstack/react-router'
import {Button} from "#/components/ui/button.tsx";
import {Card} from "#/components/ui/card.tsx";
import {Input} from "#/components/ui/input.tsx";
import {useState} from "react";

import wl from "#/assets/wl.svg"
import {Label} from "#/components/ui/label.tsx";
import {Checkbox} from "#/components/ui/checkbox.tsx";
import {Field, FieldGroup, FieldLabel} from "#/components/ui/field.tsx";
import {Footer} from "#/components/Footer.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {createShortLink} from "#/functions/links.ts";
import {Spinner} from "#/components/ui/spinner.tsx";

export const Route = createFileRoute('/')({component: Home})

function Home() {
    const navigate = Route.useNavigate();
    const [linkExpires, setLinkExpires] = useState<boolean>(false);
    const [longUrl, setLongUrl] = useState<string>('');
    const [expiration, setExpiration] = useState<string>(new Date().toISOString().split('T')[0]);

    const {mutateAsync: shorten, isPending} = useMutation({
        mutationFn: async (data: { longUrl: string; expiresAt?: Date }) => {
            return await createShortLink({ data });
        },
    }, useQueryClient())

    return (
        <div className="p-8">
            <Card className="w-full max-w-5xl mx-auto p-6">
                <h1 className="text-4xl text-center mb-6"><span
                    className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
                </h1>

                <div className="grid md:grid-cols-2 grid-cols-1">
                    <main className='h-full'>
                        <h2 className='text-center my-3 text-3xl'>Shorten. <span className='text-accent-foreground'>Share.</span> Manage.</h2>
                        <p className='text-muted-foreground'>This tools allows you to create short and manageble links to share with your friends, coworkers or classmates.</p>
                        <Label htmlFor="long-url" className="mb-2">Your long url</Label>
                        <Input placeholder="https://www.google.com/search?q=sdra..." id='long-url'
                               className="w-full mb-4" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />

                        <FieldGroup className='mb-2'>
                            <Field orientation="horizontal">
                                <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" checked={linkExpires}
                                          onCheckedChange={(e) => setLinkExpires(!!e)}/>
                                <FieldLabel htmlFor="terms-checkbox-basic">
                                    I want my short link to expire
                                </FieldLabel>
                            </Field>
                        </FieldGroup>
                        {
                            linkExpires && (<div className='p-2'>
                                    <Label htmlFor="expiration-date" className="mb-2">Expiration date</Label>
                                    <Input type='date' id='expiration-date' className="w-full mb-4" value={expiration} onChange={(e) => {setExpiration(e.target.value)}} />
                                </div>
                            )
                        }
                        <Button className="w-full" disabled={isPending} onClick={() => {
                            shorten({
                                longUrl: longUrl,
                                expiresAt: linkExpires ? new Date(expiration) : undefined
                            }).then(data => {
                                if(data.success) {
                                    navigate({to: '/manage/$url', search: {code: data.ownerCode}, params: {url: data.generatedShort}});
                                }
                            })
                        }}>{isPending && <Spinner data-icon="inline-start"/>} Shorten</Button>
                    </main>
                    <div className='hidden md:block'>
                        <img src={wl} alt="Woman typing on a laptop"/>
                    </div>
                </div>

                <hr />
                <Footer />
            </Card>
        </div>
    )
}
