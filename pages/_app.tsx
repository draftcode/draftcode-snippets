import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { EnsureAuth } from '../lib/firebase'
import { ConfigProvider } from 'antd'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
    return <>
        <Head>
            <title>Snippets</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <ConfigProvider componentSize="large">
            <EnsureAuth><Component {...pageProps} /></EnsureAuth>
        </ConfigProvider>
    </>
}
