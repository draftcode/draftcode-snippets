import { HistoryOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Empty, Input, Row, Skeleton, Space, Typography } from 'antd'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/firebase'
import { useSnippet } from "../lib/firebase-snippets"
import SnippetMarkdown from '../lib/SnippetMarkdown'


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
        <Row style={{ margin: 10 }}>
            <Col style={{ alignSelf: "center" }}>
                <Space direction="horizontal">
                    <Avatar src={getCurrentUser().photoURL} />
                    <Typography.Text strong>{`${isoWeek} (${startDate.toISODate()} - ${endDate.toISODate()})`}</Typography.Text>
                </Space>
            </Col>
            <Col flex="auto"></Col>
            <Col style={{ alignSelf: "center" }}>
                <Button type="text" icon={<LeftCircleOutlined />} onClick={prevWeek} />
                <Button type="text" icon={<RightCircleOutlined />} onClick={nextWeek} />
                <Link href="/history"><Button type="text" icon={<HistoryOutlined />} /></Link>
            </Col>
        </Row>
        <Row gutter={24}>
            <Col xs={24} xl={12}>
                {!snippet ? <Skeleton active />
                    : <Input.TextArea
                        className="snippet-editor"
                        autoSize={{ minRows: 6 }}
                        onChange={event => {
                            setPendingContent(event.target.value)
                        }}
                        value={content}
                        showCount={{ formatter: () => pendingContent === null ? "Saved" : "Pending" }}
                    />}
            </Col>
            <Col xs={24} xl={12}>
                {!snippet ? <Skeleton active />
                    : content === "" ? <Empty />
                        : <SnippetMarkdown content={content} />}
            </Col>
        </Row>
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
        <Row>
            <Col span={20} offset={2}>
                <SnippetEditor key={`${now.weekYear}-${now.weekNumber}`} year={now.weekYear} week={now.weekNumber} nextWeek={nextWeek} prevWeek={prevWeek} />
            </Col>
        </Row>
    )
}
