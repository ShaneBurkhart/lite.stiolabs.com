import { exec } from 'child_process'
import { promises as fs } from 'fs'
import { v4 as uuidv4 } from 'uuid'

const execAsync = (command, options) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        // Resolve the promise with stdout and stderr even when there's an error
        resolve({ stdout, stderr, error });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};


const run = async (thingId, command) => {
  try {
    console.log(`Running: ${command}`);
		await fs.appendFile(`/workspace/data/monorepo_logs/${thingId}.txt`, `\nRunning: ${command}\n`);
    const { stdout, stderr, error } = await execAsync(command, { cwd: '/workspace' });

    if (error) {
      const fullErrorMessageAndStack = `${error.name}: ${error.message}\n${error.stack}`;
      await fs.appendFile(`/workspace/data/monorepo_logs/${thingId}.txt`, `===== ERROR =====\n${fullErrorMessageAndStack}\n${stdout}\n${stderr}`);
      throw error;
    } else {
      await fs.appendFile(`/workspace/data/monorepo_logs/${thingId}.txt`, stdout);
      return stdout;
    }
  } catch (error) {
    const fullErrorMessageAndStack = `${error.name}: ${error.message}\n${error.stack}`
    await fs.appendFile(`/workspace/data/monorepo_logs/${thingId}.txt`, `===== ERROR =====\n${fullErrorMessageAndStack}`)
    throw error
  }
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
	package: async (run, { packageName, packageType }) => {
		// create a new package folder: /packages/<package-name>
		if (packageType === 'next.js') {
			// create a new package.json file
			// npx -y create-next-app --js --use-npm --no-eslint --no-src-dir --no-experimental-app --import-alias "@/*" --project-name asdf  asdf
			// await run(`cd packages; npx -y create-next-app --js --use-npm --no-eslint --no-src-dir --no-experimental-app --import-alias "@/*" --project-name ${packageName} ${packageName}`)
			// await run(`cp /workspace/monorepo/cli/dockerfiles/Dockerfile.javascript packages/${packageName}/Dockerfile`)
			// await run(`cp /workspace/monorepo/cli/dockerfiles/.dockerignore packages/${packageName}/.dockerignore`)
			await run(`cd packages/${packageName}; python3 /workspace/monorepo/cli/install_scripts/next-prisma.py`)
			await run(`cd packages/${packageName}; python3 /workspace/monorepo/cli/install_scripts/next-tailwind.py`)

			const composeAdd = NEXTJS_DOCKER_COMPOSE_ADD(packageName)
			// await fs.appendFile('/workspace/docker-compose.yaml', composeAdd)
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

		const thingId = uuidv4()
		const logFile = `https://monorepo_logs.shane.stiolabs.com/${thingId}.txt`
		const _run = async (command) => await run(thingId, command)
		await _run(`echo "===== START =====" > /workspace/data/monorepo_logs/${thingId}.txt`)

		console.log(`Logs: ${logFile}`)
		res.status(200).json({ thingId, logFile })

		try {
			console.log(`Running ${thing} ${thingId}...`)
			await t(_run, { packageName, packageType: runtime })
		} catch (error) {
			console.error(error)
		}

		await _run(`echo "===== END =====" >> /workspace/data/monorepo_logs/${thingId}.txt`)
  } else {
    res.status(404).send('Not Found')
  }
}
