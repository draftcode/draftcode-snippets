import { HistoryOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/firebase'
import { useSnippet } from "../lib/firebase-snippets"
import SnippetMarkdown from '../lib/SnippetMarkdown'
import Editor from '@monaco-editor/react'
import Avatar from '../lib/Avatar'

const SnippetEditor = ({ year, week, nextWeek, prevWeek }: { year: number, week: number, nextWeek: () => void, prevWeek: () => void }) => {
    const { data: snippet, error, mutate } = useSnippet(year, week)
    const [savedContent, setSavedContent] = useState<string | null>(null)
    const [pendingContent, setPendingContent] = useState<string | null>(null)

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (pendingContent === null) {
                return
            }
            if (savedContent !== pendingContent) {
                setSavedContent(pendingContent)
                setPendingContent(null)

                mutate(pendingContent)
            }
        }, 1000)
        return () => clearTimeout(timeOutId)
    }, [snippet, pendingContent, setPendingContent, savedContent, setSavedContent, mutate])

    if (error) {
        return <div>Failed to load the snippet</div>
    }
    if (snippet && savedContent === null) {
        setSavedContent(snippet.content)
    }
    const isoWeek = `${year}-W${week.toString().padStart(2, '0')}`
    const startDate = DateTime.fromISO(`${isoWeek}-1`)
    const endDate = DateTime.fromISO(`${isoWeek}-7`)

    const content = pendingContent ?? savedContent ?? ""
    return <>
        <div className="flex flex-col h-screen pb-6">
            <div className="px-4 py-4 flex justify-between text-xl">
                <div className="flex space-x-2 items-center">
                    <Avatar user={getCurrentUser()} />
                    <h1>{`${isoWeek} (${startDate.toISODate()} - ${endDate.toISODate()})`}</h1>
                </div>
                <div className="flex space-x-1 items-center">
                    <button onClick={prevWeek} className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><LeftCircleOutlined /></button>
                    <button onClick={nextWeek} className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><RightCircleOutlined /></button>
                    <Link href="/history" className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center"><HistoryOutlined /></Link>
                </div>
            </div>
            {
                !snippet ? null : (
                    <div className="grow flex">
                        <SnippetMarkdown content={content} className="min-w-[65ch]" />
                        <div className="grow">
                            <Editor
                                defaultValue={content}
                                language="markdown"
                                options={{
                                    scrollBeyondLastLine: false,
                                    minimap: {
                                        enabled: false,
                                    }
                                }}
                                onChange={(value) => {
                                    setPendingContent(value ?? '')
                                }}
                            />
                        </div>
                    </div>
                )
            }
        </div>
    </>
}

export default function Page() {
    const [now, setNow] = useState(DateTime.now())
    const nextWeek = useCallback(() => {
        setNow((now) => {
            return now.plus({ weeks: 1 })
        })
    }, [setNow])
    const prevWeek = useCallback(() => {
        setNow((now) => {
            return now.minus({ weeks: 1 })
        })
    }, [setNow])
    return (
        <div className="container mx-auto h-screen">
            <SnippetEditor key={`${now.weekYear}-${now.weekNumber}`} year={now.weekYear} week={now.weekNumber} nextWeek={nextWeek} prevWeek={prevWeek} />
        </div>
    )
}
