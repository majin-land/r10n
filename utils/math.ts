import Big from 'big.js'

type NumberLike = Big.BigSource

const add = (x: NumberLike, y: NumberLike): number => {
  const bigX = new Big(x)
  const bigY = new Big(y)
  return bigX.plus(bigY).toNumber()
}

const subtract = (x: NumberLike, y: NumberLike): number => {
  const bigX = new Big(x)
  const bigY = new Big(y)
  return bigX.minus(bigY).toNumber()
}

// there are some calc bugs in js , it's should fixed by bignumber
// eg: 115.38 * 100 = 11538
// 1115.38 * 100 = 11538.000000000000000000001
const multiply = (x: NumberLike, y: NumberLike): number => {
  const bigX = new Big(x)
  const bigY = new Big(y)
  return bigX.times(bigY).toNumber()
}

const divide = (x: NumberLike, y: NumberLike): number => {
  const bigX = new Big(x)
  const bigY = new Big(y)

  if (bigY.eq(0)) {
    throw new Error('Division by zero is not allowed')
  }

  return bigX.div(bigY).toNumber()
}

const formatCommaNumber = (value: NumberLike): number => {
  const formattedValue = new Big(value).toFixed(2)
  return parseFloat(formattedValue)
}

export { add, subtract, multiply, divide, formatCommaNumber }