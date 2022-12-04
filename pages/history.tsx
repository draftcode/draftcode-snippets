import { EditOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import Avatar from '../lib/Avatar'
import { getCurrentUser } from '../lib/firebase'
import { Snippet, useAnnualSnippets } from "../lib/firebase-snippets"
import SnippetMarkdown from '../lib/SnippetMarkdown'

const RenderedSnippet = ({ snippet }: { snippet: Snippet }) => {
    const isoWeek = `${snippet.year}-W${snippet.week.toString().padStart(2, '0')}`
    const startDate = DateTime.fromISO(`${isoWeek}-1`)
    const endDate = DateTime.fromISO(`${isoWeek}-7`)

    return (
        <div className="flex gap-4 py-4">
            <div className="flex-1 text-right min-w-[20ch]">
                <div>
                    <h2 className="text-xl font-bold">{isoWeek}</h2>
                    {`${startDate.toISODate()} - ${endDate.toISODate()}`}
                </div>
            </div>
            <SnippetMarkdown className="min-w-[65ch]" content={snippet.content} />
            <div className="flex-1"></div>
        </div>
    )
}

const SnippetViewer = ({ year, nextYear, prevYear }: { year: number, nextYear: () => void, prevYear: () => void }) => {
    const { data: snippets, error } = useAnnualSnippets(year)
    if (error) {
        return <div>Failed to load the snippet</div>
    }
    return <>
        <div className="flex flex-col h-screen pb-6">
            <div className="px-4 py-4 flex justify-between text-xl">
                <div className="flex space-x-2 items-center">
                    <Avatar user={getCurrentUser()} />
                    <h1>{`${year}`}</h1>
                </div>
                <div className="flex space-x-1 items-center">
                    <button onClick={prevYear} className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><LeftCircleOutlined /></button>
                    <button onClick={nextYear} className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><RightCircleOutlined /></button>
                    <Link href="/" className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><EditOutlined /></Link>
                </div>
            </div>
            <div className="divide-y-2">
                {!snippets ? null : snippets.map(snippet => <RenderedSnippet key={`${snippet.year}-${snippet.week}`} snippet={snippet} />)}
            </div>
        </div>
    </>
}

export default function Page() {
    const [now, setNow] = useState(DateTime.now())
    const nextYear = useCallback(() => {
        setNow((now) => {
            return now.plus({ years: 1 })
        })
    }, [setNow])
    const prevYear = useCallback(() => {
        setNow((now) => {
            return now.minus({ years: 1 })
        })
    }, [setNow])
    return (
        <div className="container mx-auto h-screen">
            <SnippetViewer key={`${now.weekYear}`} year={now.weekYear} nextYear={nextYear} prevYear={prevYear} />
        </div>
    )
}
