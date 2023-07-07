function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Функция принимает только числа');
  }
  return a + b;
}

module.exports = sum;
