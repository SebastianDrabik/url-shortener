import {Card} from "#/components/ui/card.tsx";
import {Footer} from "#/components/Footer.tsx";
import * as React from "react";
import {cn} from "#/lib/utils.ts";

export function PageTemplate(props: {children: React.ReactNode, img: string, imgAlt: string, imgPlacement: 'left' | 'right' | 'bottom', hideHeader?: boolean}) {
    return <div className="p-8">
        <Card className="w-full max-w-5xl mx-auto p-6">
            <h1 className={cn("text-4xl text-center mb-6", props.hideHeader && 'hidden')}>
                <span className='text-accent-foreground font-bold'>sortURL</span> by sdrabik
            </h1>

            <div className={cn('grid grid-cols-1', props.imgPlacement !== 'bottom' && 'md:grid-cols-2')}>
                <main className={cn('h-full', props.imgPlacement === "left" ? "md:order-2" : "md:order-1")}>
                    {props.children}
                </main>
                <div className={cn('flex justify-center', props.imgPlacement === 'bottom' ? 'order-2' : 'hidden md:flex', props.imgPlacement === "left" ? "md:order-1" : "md:order-2")}>
                    <img src={props.img} alt={props.imgAlt}/>
                </div>
            </div>
            <hr/>
            <Footer/>
        </Card>
    </div>
}