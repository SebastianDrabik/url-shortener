import {Card} from "#/components/ui/card.tsx";
import {Footer} from "#/components/Footer.tsx";
import * as React from "react";

export function PageTemplate(props: {children: React.ReactNode, img: string, imgAlt: string, imagePlacement: 'left' | 'right'}) {
    return <div className="p-8">
        <Card className="w-full max-w-5xl mx-auto p-6">
            <h1 className="text-4xl text-center mb-6">
                <span className='text-accent-foreground font-bold'>shortURL</span> by sdrabik
            </h1>

            <div className="grid md:grid-cols-2 grid-cols-1">
                <main className='h-full'>
                    {props.children}
                </main>
                <div className='hidden md:block'>
                    <img src={props.img} alt={props.imgAlt}/>
                </div>
            </div>
            <hr/>
            <Footer/>
        </Card>
    </div>
}