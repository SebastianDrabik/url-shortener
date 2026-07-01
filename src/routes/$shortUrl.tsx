import {createFileRoute, Link, redirect} from '@tanstack/react-router'
import {getShortLinkInfo} from "#/functions/links.functions";
import {PageTemplate} from "#/components/PageTemplate.tsx";
import manQuestionMark from '@/assets/mq.svg'
import {Button} from "#/components/ui/button.tsx";
import {Card} from "#/components/ui/card.tsx";

export const Route = createFileRoute('/$shortUrl')({
  component: RouteComponent,
  loader: async ({params} ) => {
    const l = await getShortLinkInfo({data: {shortUrl: params.shortUrl}})

    if(l.success){
      throw redirect({
        href: l.data.longUrl,
        statusCode: 301,
      })
    }

    return l
  }
})

function RouteComponent() {
  const link = Route.useLoaderData()

  return <PageTemplate img={manQuestionMark} imgAlt="Man holding question mark sign" imgPlacement='right'>
    <div className={'flex flex-col items-center h-full p-6'}>
      <div className='flex flex-col items-center justify-center flex-1'>
        <h2 className={'text-2xl font-bold mb-4 text-center'}>
          The link you are looking for is <span className='text-accent-foreground'>not available</span>
        </h2>
        <p className='text-xl mb-4'>But it's not the end of the world</p>
        <Button asChild size={'lg'}>
          <Link to='/'>You can create a new one!</Link>
        </Button>
      </div>

      <Card className={'flex flex-row items-center gap-2 p-4 mt-auto w-full max-w-md'}>
        <h4 className='font-semibold'>Reason:</h4>
        <p className='text-muted-foreground'>{link.message}</p>
      </Card>
    </div>
  </PageTemplate>
}
