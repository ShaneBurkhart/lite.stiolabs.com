import { exec } from 'child_process'
import { promises as fs } from 'fs'

const run = async (command) => {
	await new Promise((resolve, reject) => {
		exec(command, { cwd: '/workspace' }, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`)
				reject(error)
				return
			}
			console.log(`stdout: ${stdout}`)
			console.log(`stderr: ${stderr}`)
			resolve(stdout)
		})
	})
}

const NEXTJS_DOCKER_COMPOSE_ADD = (packageName) => `
	${packageName}:
		build:
			context: ./packages/${packageName}
			dockerfile: Dockerfile
		volumes:
			- ./packages/${packageName}:/app
			- ./data/${packageName}:/data
		env_file:
			- .env
	#	ports:
	#		- 3000:3000
		command: npm run dev
`.replace(/\t/g, '  ');

const THINGS = {
	package: async (packageName, packageType) => {
		// create a new package folder: /packages/<package-name>
		if (packageType === 'next.js') {
			// create a new package.json file
			// npx -y create-next-app --js --use-npm --no-eslint --no-src-dir --no-experimental-app --import-alias "@/*" --project-name asdf  asdf
			await run(`cd packages; npx -y create-next-app --js --use-npm --no-eslint --no-src-dir --no-experimental-app --import-alias "@/*" --project-name ${packageName} ${packageName}`)
			await run(`cp /workspace/monorepo/cli/dockerfiles/Dockerfile.javascript packages/${packageName}/Dockerfile`)
			await run(`cd packages/${packageName}; python3 /workspace/monorepo/cli/install_scripts/next-prisma.py`)

			const composeAdd = NEXTJS_DOCKER_COMPOSE_ADD(packageName)
			await fs.appendFile('/workspace/docker-compose.yaml', composeAdd)
		}
	}
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { thing } = req.query
		const { runtime, packageName } = req.body
		const t = THINGS[thing]

		if (!t || !runtime || !packageName) {
			res.status(400).send('Bad Request')
			return
		}

		if (typeof t !== 'function') {
			res.status(500).send('Server Error')
			return
		}

		try {
			const result = await t(packageName, runtime)

			res.status(200).json(result)
		} catch (error) {
			console.error(error)
			res.status(500).send('Server Error')
			return
		}
  } else {
    res.status(404).send('Not Found')
  }
}
