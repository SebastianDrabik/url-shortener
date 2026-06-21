import { createFileRoute } from '@tanstack/react-router'
import {Button} from "#/components/ui/button.tsx";
import {Card} from "#/components/ui/card.tsx";
import {Input} from "#/components/ui/input.tsx";
import {useState} from "react";

import wl from "#/assets/wl.svg"
import {Label} from "#/components/ui/label.tsx";
import {Checkbox} from "#/components/ui/checkbox.tsx";
import {Field, FieldGroup, FieldLabel} from "#/components/ui/field.tsx";

export const Route = createFileRoute('/')({ component: Home })

function Home() {
    const [linkExpires, setLinkExpires] = useState<boolean>(false);

  return (
    <div className="p-8">
      <Card className="w-full max-w-5xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-4"><span className='text-accent-foreground font-bold'>shortURL</span> by sdrabik</h1>

        <div className="grid grid-cols-2">
            <main>
                <h2 className='text-center my-3 text-2xl'>Shorten your url</h2>
                <Label htmlFor="long-url" className="mb-2">Your long url</Label>
                <Input placeholder="https://www.google.com/search?q=dsa..." id='long-url' className="w-full mb-4" />

                <FieldGroup className="">
                    <Field orientation="horizontal">
                        <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" checked={linkExpires} onCheckedChange={(e) => setLinkExpires(!!e)} />
                        <FieldLabel htmlFor="terms-checkbox-basic">
                            I want my short link to expire
                        </FieldLabel>
                    </Field>
                </FieldGroup>
                {
                    linkExpires && (<div className='p-2'>
                            <Label htmlFor="expiration-date" className="mb-2">Expiration date</Label>
                            <Input type='date' id='expiration-date' className="w-full mb-4" />
                        </div>
                    )
                }
                <Button className="w-full">Shorten</Button>
            </main>
            <div>
                <img src={wl} alt="Woman typing on a laptop" />
            </div>
        </div>
      </Card>
    </div>
  )
}
