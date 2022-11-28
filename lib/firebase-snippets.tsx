import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import useSWR, { useSWRConfig } from 'swr'
import { db, getCurrentUser } from './firebase'

export interface Snippet {
    year: number
    week: number
    content: string
}

async function getSnippet(year: number, week: number): Promise<Snippet> {
    const user = getCurrentUser()
    const weekNumber = week.toString().padStart(2, '0')
    const docRef = doc(db, 'users', user.uid, 'weekly-snippets', `${year}-W${weekNumber}`)

    const snippet = await getDoc(docRef)
    if (!snippet.exists()) {
        return {
            year: year,
            week: week,
            content: '',
        }
    }
    return {
        year: year,
        week: week,
        content: snippet.data().content,
    }
}

async function updateSnippet(year: number, week: number, content: string): Promise<void> {
    const user = getCurrentUser()
    const weekNumber = week.toString().padStart(2, '0')
    const docRef = doc(db, 'users', user.uid, 'weekly-snippets', `${year}-W${weekNumber}`)
    if (content === '') {
        await deleteDoc(docRef)
    } else {
        const snippet = {
            year: year,
            week: week,
            content: content,
        }
        await setDoc(docRef, snippet)
    }
}

async function getAnnualSnippet(year: number): Promise<Array<Snippet>> {
    const user = getCurrentUser()
    const q = query(collection(db, 'users', user.uid, 'weekly-snippets'), where('year', '==', year))
    const snapshot = await getDocs(q)
    const ret = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
            year: data.year,
            week: data.week,
            content: data.content,
        }
    })
    return ret.sort((a, b) => b.week - a.week)
}

export function useSnippet(year: number, week: number): { data?: Snippet, error?: any, mutate: (content: string) => Promise<void> } {
    const { data, error, mutate } = useSWR([year, week], getSnippet)
    const { mutate: globalMutate } = useSWRConfig();

    return {
        data,
        error,
        mutate: async (content: string) => {
            await updateSnippet(year, week, content)
            mutate()
            globalMutate([year])
        }
    }
}

export function useAnnualSnippets(year: number): { data?: Array<Snippet>, error?: any } {
    return useSWR([year], getAnnualSnippet)
}
