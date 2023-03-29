import calculate from '../calculateProjectValues'

export default function useCalculatedProjectValues(project={}) {
	return calculate(project)
}
