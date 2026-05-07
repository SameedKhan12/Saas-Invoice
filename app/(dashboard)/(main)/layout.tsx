import StripeBanner from "@/components/stripe-banner";

export default async function MainLayout({children}:{children:React.ReactNode}){
    return(
        <>
        <StripeBanner/>
        {children}
        </>
    )
}