import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })
const STIO_DOMAIN = process.env.STIO_DOMAIN || 'shaneburkhart.com'
const STIO_USER = process.env.STIO_USER || 'shane';

const LINKS = [
  { label: "Dozzle (Docker Logs)", href: `http://dozzle.${STIO_USER}.${STIO_DOMAIN}` },
  { label: "Prisma (Database Explorer)", href: `http://prisma.${STIO_USER}.${STIO_DOMAIN}` },
  { label: "Tests", href: `` },
  { label: "Diagrams (Create Diagrams)", href: `http://diagrams.${STIO_USER}.${STIO_DOMAIN}` },
  { label: "Do Nothings (Shortcuts)", href: `/do-nothings` },
]

const APPS = [
  { label: "lite.stiolabs.com", href: `http://lite_stiolabs.${STIO_USER}.${STIO_DOMAIN}` },
]

const CREATE = [
  { label: "Package", href: `/create/package` },
  { label: "Deployment", href: `http://list_stiolabs.${STIO_USER}.${STIO_DOMAIN}` },
  { label: "Lambda", href: `http://list_stiolabs.${STIO_USER}.${STIO_DOMAIN}` },
]

// const PACKAGES/Deployments

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-xl mx-auto mt-6">
				<div className="flex">
					<div className="mr-2 w-full">
            <h2 className="text-4xl font-bold text-center mb-4">Apps</h2>
						{APPS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								className="block p-2 mb-4 text-lg font-bold text-center text-white bg-orange-500 rounded-md"
							>{label}</a>
						))}
					</div>
					<div className="ml-2 w-full">
            <h2 className="text-4xl font-bold text-center mb-4">Utils</h2>
						{LINKS.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								className="block p-2 mb-4 text-lg font-bold text-center text-white bg-blue-500 rounded-md"
							>{label}</a>
						))}
					</div>
				</div>
				<div className="flex">
					<div className="mr-2 w-full">
					</div>
					<div className="ml-2 w-full">
            <h2 className="text-4xl font-bold text-center mb-4">Create</h2>
						{CREATE.map(({ label, href }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								className="block p-2 mb-4 text-lg font-bold text-center text-white bg-green-500 rounded-md"
							>{label}</a>
						))}
					</div>
				</div>
      </main>
    </>
  )
}
