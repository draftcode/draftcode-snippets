import { EditOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Divider, Row, Skeleton, Space, Typography } from 'antd'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { getCurrentUser } from '../lib/firebase'
import { Snippet, useAnnualSnippets } from "../lib/firebase-snippets"
import SnippetMarkdown from '../lib/SnippetMarkdown'

const RenderedSnippet = ({ snippet }: { snippet: Snippet }) => {
    const isoWeek = `${snippet.year}-W${snippet.week.toString().padStart(2, '0')}`
    const startDate = DateTime.fromISO(`${isoWeek}-1`)
    const endDate = DateTime.fromISO(`${isoWeek}-7`)

    return <>
        <Divider orientation="left">{`${isoWeek} (${startDate.toISODate()} - ${endDate.toISODate()})`}</Divider>
        <SnippetMarkdown content={snippet.content} />
    </>
}

const SnippetViewer = ({ year, nextYear, prevYear }: { year: number, nextYear: () => void, prevYear: () => void }) => {
    const { data: snippets, error } = useAnnualSnippets(year)
    if (error) {
        return <div>Failed to load the snippet</div>
    }
    return <>
        <Row style={{ margin: 10 }}>
            <Col style={{ alignSelf: "center" }}>
                <Space direction="horizontal">
                    <Avatar src={getCurrentUser().photoURL} />
                    <Typography.Text strong>{`${year}`}</Typography.Text>
                </Space>
            </Col>
            <Col flex="auto"></Col>
            <Col style={{ alignSelf: "center" }}>
                <Button type="text" icon={<LeftCircleOutlined />} onClick={prevYear} />
                <Button type="text" icon={<RightCircleOutlined />} onClick={nextYear} />
                <Link href="/"><Button type="text" icon={<EditOutlined />} /></Link>
            </Col>
        </Row>
        {!snippets ? <Skeleton active />
            : snippets.map(snippet => <RenderedSnippet key={`${snippet.year}-${snippet.week}`} snippet={snippet} />)}
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
        <Row>
            <Col span={20} offset={2}>
                <SnippetViewer key={`${now.weekYear}`} year={now.weekYear} nextYear={nextYear} prevYear={prevYear} />
            </Col>
        </Row>
    )
}
