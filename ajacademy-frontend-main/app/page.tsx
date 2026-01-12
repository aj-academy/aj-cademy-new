import Head from 'next/head';

export default function RootPage() {
  // We don't need to do anything here - NextJS config handles the redirect
  return (
    <>
      <Head>
        <title>Home | AJ Academy</title>
        <meta name="description" content="Elevate your skills with AJ Academy. Access expert-led courses, job opportunities, and more." />
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redirecting to Home...</h1>
          <p className="mt-2">If you are not redirected, <a href="/home" className="text-blue-600 underline">click here</a>.</p>
        </div>
      </div>
    </>
  )
}
