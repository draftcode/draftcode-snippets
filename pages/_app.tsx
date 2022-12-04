import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { EnsureAuth } from '../lib/firebase'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
    return <>
        <Head>
            <title>Snippets</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <EnsureAuth><Component {...pageProps} /></EnsureAuth>
    </>
}
