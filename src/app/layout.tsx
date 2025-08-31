export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <link rel="icon" href="icon.png" sizes="any" />
            <body>
                {children}
            </body>
        </html>
    )
}