import { createFileRoute } from '@tanstack/react-router'
import {getRedirectLink} from "#/functions/links.ts";

export const Route = createFileRoute('/$shortUrl')({
  component: RouteComponent,
  loader: async ({params} ) => {
    return await getRedirectLink({data: {shortUrl: params.shortUrl}})
  }
})

function RouteComponent() {
  const link = Route.useLoaderData()

  if (!link.success)
  {
    return <div>{link.message}</div>
  }

  return <div>Redirect to: <a className='text-accent-foreground' href={link.redirect}>{link.redirect}</a></div>
}
