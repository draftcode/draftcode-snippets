import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkEmoji from "remark-emoji"
import { remarkTruncateLinks } from "remark-truncate-links"
import rehypeKatex from "rehype-katex"
import rehypeTwemojify from "rehype-twemojify"
import { BorderOutlined, CheckSquareFilled } from "@ant-design/icons"
import 'katex/dist/katex.min.css'

function classNames(...classes: Array<string | undefined>) {
    return classes.filter(Boolean).join(' ')
}

const SnippetMarkdown = ({ content, className }: { content: string, className?: string }) => {
    return <ReactMarkdown
        className={classNames(className, "snippet-content prose")}
        components={{
            input: ({ checked }) => {
                if (checked) {
                    return <CheckSquareFilled style={{ color: '#389e0d' }} className="task-icon" />
                } else {
                    return <BorderOutlined className="task-icon" />
                }
            },
        }}
        remarkPlugins={[remarkEmoji, remarkGfm, remarkMath, remarkTruncateLinks]}
        rehypePlugins={[
            rehypeKatex,
            [rehypeTwemojify, {
                type: 'next',
            }],
        ]}
    >{content}</ReactMarkdown>
}

export default SnippetMarkdown
