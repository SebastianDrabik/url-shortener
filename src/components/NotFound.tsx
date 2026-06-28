import notFoundImg from '@/assets/not-found.svg'

export function NotFound() {
    return <div className="flex flex-col items-center justify-center h-screen gap-4">
        <img src={notFoundImg} alt="Laptop displaying 404 - not found error" />
    </div>
}