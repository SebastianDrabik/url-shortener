import { createFileRoute } from '@tanstack/react-router'
import {Button} from "#/components/ui/button.tsx";
import {Card} from "#/components/ui/card.tsx";

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <Card className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome to the Home Page</h1>
        <p className="mb-4">This is a simple example of a home page using React Router and Tailwind CSS.</p>
        <Button variant='default'>Click Me</Button>
      </Card>
    </div>
  )
}
