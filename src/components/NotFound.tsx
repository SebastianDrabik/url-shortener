import {PageTemplate} from "#/components/PageTemplate.tsx";
import notFoundImg from '@/assets/not-found.svg'
import {Button} from "#/components/ui/button.tsx";
import {Link} from "@tanstack/react-router";

export function NotFound() {
    return <PageTemplate img={notFoundImg} imgPlacement={'bottom'} imgAlt={'Laptop displaying 404 - not found error'} hideHeader >
        <div className='flex justify-center flex-col items-center mb-4'>
            <h1 className="text-4xl font-bold mb-2 text-center">Not Found</h1>
            <p className="text-center mb-4 text-md">The page you are looking for does not exist.</p>
            <Button asChild >
                <Link to={'/'}>Bring me back to homepage</Link>
            </Button>
        </div>
    </PageTemplate>
}