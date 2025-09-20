if (!Array.prototype.toReversed) {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function () {
      return [...this].reverse();
    },
    writable: true,
    configurable: true,
  });
}

export {}