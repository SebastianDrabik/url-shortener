import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {QueryClient,
  QueryClientProvider,} from "@tanstack/react-query";

import appCss from '../styles.css?url'
import {NotFound} from "#/components/NotFound.tsx";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'URL Shortener',
      },
      {
        name: 'description',
        content: 'Simple URL shortener app',
      },
      {
        name: 'og:title',
        content: 'URL shortener',
      },
      {
        name: 'twitter:title',
        content: 'URL shortener',
      },
      {
        name: 'og:description',
        content: 'Simple URL shortener app by Sebastian Drabik',
      },
      {
        name: 'twitter:description',
        content: 'Simple URL shortener app by Sebastian Drabik',
      },
      {
        name: 'og:image',
        content: '/icon.svg',
      },
      {
        name: 'twitter:image',
        content: '/icon.svg',
      },
      {
        name: 'og:url',
        content: 'https://url.sdrabik.dev/',
      },
      {
        name: 'twitter:url',
        content: 'https://url.sdrabik.dev/',
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/icon.svg'
      }
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="dark">
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
