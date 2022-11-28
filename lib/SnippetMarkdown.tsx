import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkEmoji from "remark-emoji"
import rehypeKatex from "rehype-katex"
import rehypeTwemojify from "rehype-twemojify"
import { BorderOutlined, CheckSquareFilled } from "@ant-design/icons"
import 'katex/dist/katex.min.css'

const SnippetMarkdown = ({ content }: { content: string }) => {
    return <ReactMarkdown
        className="snippet-content"
        components={{
            input: ({ checked }) => {
                if (checked) {
                    return <CheckSquareFilled className="task" style={{ color: '#389e0d' }} />
                } else {
                    return <BorderOutlined className="task" />
                }
            },
        }}
        remarkPlugins={[remarkEmoji, remarkGfm, remarkMath]}
        rehypePlugins={[
            rehypeKatex,
            [rehypeTwemojify, {
                type: 'next',
            }],
        ]}
    >{content}</ReactMarkdown>
}

export default SnippetMarkdown
