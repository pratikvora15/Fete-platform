import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedPartnerRoute = createRouteMatcher([
  '/partner/dashboard(.*)',
  '/partner/calendar(.*)',
  '/partner/inquiries(.*)',
  '/partner/profile(.*)',
  '/partner/photos(.*)',
  '/partner/pricing(.*)',
  '/partner/analytics(.*)',
  '/partner/reviews(.*)',
  '/partner/earnings(.*)',
  '/partner/settings(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPartnerRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
