const OPERATION_SYMBOLS = ['+', '-', '*', '/']

function createTree (operationString, index = 0, tree = []) {
  const currentCharacter = operationString[0]
  if (operationString.length === 0) return tree

  if (tree.length > 0 && isBothAreNumbers(tree[tree.length - 1].value, currentCharacter)) {
    tree[tree.length - 1].value += currentCharacter
  } else if (tree.length === 1 && '+-'.includes(tree[0].value)) {
    tree[tree.length - 1].value += currentCharacter
  } else if (!isNaN(currentCharacter) || OPERATION_SYMBOLS.includes(currentCharacter)) {
    tree.push({ value: currentCharacter })
  } else if (currentCharacter === '(') {
    const { length, children } = createTree(operationString.slice(1))
    operationString = operationString.slice(length)
    index += length
    tree.push({ value: 'X', children })
  } else if (currentCharacter === ')') {
    return { length: index + 1, children: tree }
  }

  return createTree(operationString.slice(1), index + 1, tree)
}

function isBothAreNumbers (a, b) {
  return !isNaN(a) && !isNaN(b)
}

function resolveOperation (tree) {
  if (tree.length === 1) return tree[0].value

  const parenthesisIndex = tree.findIndex(data => data.value === 'X')
  if (parenthesisIndex > -1) {
    const parenthesisResult = resolveOperation(tree[parenthesisIndex].children)
    tree[parenthesisIndex] = { value: parenthesisResult }
  }

  const multiplicationOrDivisionIndex = tree.findIndex(data => '*/'.includes(data.value))
  if (multiplicationOrDivisionIndex > -1) {
    const [before, symbol, after] = [tree[multiplicationOrDivisionIndex - 1], tree[multiplicationOrDivisionIndex], tree[multiplicationOrDivisionIndex + 1]]
    const result = resolveBinaryOperation(before.value, symbol.value, after.value)
    tree[multiplicationOrDivisionIndex - 1] = { value: result }
    tree = tree.filter((_, index) => index !== multiplicationOrDivisionIndex && index !== multiplicationOrDivisionIndex + 1)
    return resolveOperation(tree)
  }

  const sumOrSubtractionIndex = tree.findIndex(data => '+-'.includes(data.value))
  if (sumOrSubtractionIndex > -1) {
    const [before, symbol, after] = [tree[sumOrSubtractionIndex - 1], tree[sumOrSubtractionIndex], tree[sumOrSubtractionIndex + 1]]
    const result = resolveBinaryOperation(before.value, symbol.value, after.value)
    tree[sumOrSubtractionIndex - 1] = { value: result }
    tree = tree.filter((_, index) => index !== sumOrSubtractionIndex && index !== sumOrSubtractionIndex + 1)
    return resolveOperation(tree)
  }
}

function resolveBinaryOperation (before, symbol, after) {
  const beforeToNumber = parseFloat(before)
  const afterToNumber = parseFloat(after)
  if (isNaN(beforeToNumber) || isNaN(afterToNumber)) throw new Error('Invalid operation')

  if (symbol === '*') {
    return beforeToNumber * afterToNumber
  } else if (symbol === '/') {
    return beforeToNumber / afterToNumber
  } else if (symbol === '+') {
    return beforeToNumber + afterToNumber
  } else if (symbol === '-') {
    return beforeToNumber - afterToNumber
  }
}

export const Calculator = {
  calculate (operationString) {
    const tree = createTree(operationString)
    const result = resolveOperation(tree)
    return result
  }
}
