export function Button({ children, additionalStyling}: Readonly<{
    children: React.ReactNode;
    additionalStyling?: string;
}>) {
    return (
        <button className={`${additionalStyling}
        rounded-full px-10 py-3 shadow-md shadow-black/25
        hover:shadow-inner hover:shadow-black/50`}>{children}</button>
    )
}