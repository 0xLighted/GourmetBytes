import { Odor_Mean_Chey, Cutive_Mono } from 'next/font/google'

const odor = Odor_Mean_Chey({
    weight: '400'
})

const vt = Cutive_Mono({
    weight: '400'
})

export function Header() {
    return (
        <nav className="text-4xl">
            <span className={`${odor.className} text-dark`}>Gourmet&nbsp;</span>
            <span className={vt.className}>Bytes</span>
        </nav>
    )
}