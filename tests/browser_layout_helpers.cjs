const { expect } = require('@playwright/test');

async function expectFullWidth(locator) {
  const regions = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const parent = element.parentElement;
      const style = getComputedStyle(parent);
      const available =
        parent.getBoundingClientRect().width -
        parseFloat(style.borderLeftWidth) -
        parseFloat(style.borderRightWidth) -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      return {
        name: element.id || element.className || element.tagName,
        width: element.getBoundingClientRect().width,
        available,
      };
    }),
  );
  expect(regions.length).toBeGreaterThan(0);
  for (const { name, width, available } of regions) {
    expect(Math.abs(width - available), `${name}: ${width}px in ${available}px`).toBeLessThan(2);
  }
}

module.exports = { expectFullWidth };
