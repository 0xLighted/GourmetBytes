import { Odor_Mean_Chey } from "next/font/google"

const odor = Odor_Mean_Chey({
    weight: '400'
})

export function Footer() {
    return (
        <footer>
            <h3 className={`${odor.className} text-xl`}>Powered By <span className="bg-gradient-to-br  from-[#4FABFF] via-[#AECBFA] via-[#7b7cd3] to-[#c16783] text-transparent bg-clip-text">
              Gemini
            </span></h3>
        </footer>
    )
}
