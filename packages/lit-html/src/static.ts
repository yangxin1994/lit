/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {html as coreHtml, svg as coreSvg, TemplateResult} from './lit-html.js';

/**
 * Wraps a string so that it behaves like part of the static template
 * strings instead of a dynamic value.
 *
 * Users must take care to ensure that adding the static string to the template
 * results in well-formed HTML, or else templates may break unexpectedly.
 *
 * Note that this function is unsafe to use on untrusted content, as it will be
 * directly parsed into HTML. Do not pass user input to this function
 * without sanitizing it.
 *
 * Static values can be changed, but they will cause a complete re-render
 * since they effectively create a new template.
 */
export const unsafeStatic = (value: string) => ({
  ['_$litStatic$']: value,
});

const textFromStatic = (value: StaticValue) => {
  if (value['_$litStatic$'] !== undefined) {
    return value['_$litStatic$'];
  } else {
    throw new Error(
      `Value passed to 'literal' function must be a 'literal' result: ${value}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`
    );
  }
};

/**
 * Tags a string literal so that it behaves like part of the static template
 * strings instead of a dynamic value.
 *
 * The only values that may be used in template expressions are other tagged
 * `literal` results or `unsafeStatic` values (note that untrusted content
 * should never be passed to `unsafeStatic`).
 *
 * Users must take care to ensure that adding the static string to the template
 * results in well-formed HTML, or else templates may break unexpectedly.
 *
 * Static values can be changed, but they will cause a complete re-render since
 * they effectively create a new template.
 */
export const literal = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => ({
  ['_$litStatic$']: values.reduce(
    (acc, v, idx) => acc + textFromStatic(v as StaticValue) + strings[idx + 1],
    strings[0]
  ),
});

type StaticValue = ReturnType<typeof unsafeStatic>;

const stringsCache = new Map<string, TemplateStringsArray>();

/**
 * Wraps a lit-html template tag (`html` or `svg`) to add static value support.
 */
export const withStatic =
  (coreTag: typeof coreHtml | typeof coreSvg) =>
  (strings: TemplateStringsArray, ...values: unknown[]): TemplateResult => {
    const l = values.length;
    let staticValue: string | undefined;
    let dynamicValue: unknown;
    const staticStrings: Array<string> = [];
    const dynamicValues: Array<unknown> = [];
    let i = 0;
    let hasStatics = false;
    let s: string;

    while (i < l) {
      s = strings[i];
      // Collect any unsafeStatic values, and their following template strings
      // so that we treat a run of template strings and unsafe static values as
      // a single template string.
      while (
        i < l &&
        ((dynamicValue = values[i]),
        (staticValue = (dynamicValue as StaticValue)?.['_$litStatic$'])) !==
          undefined
      ) {
        s += staticValue + strings[++i];
        hasStatics = true;
      }
      dynamicValues.push(dynamicValue);
      staticStrings.push(s);
      i++;
    }
    // If the last value isn't static (which would have consumed the last
    // string), then we need to add the last string.
    if (i === l) {
      staticStrings.push(strings[l]);
    }

    if (hasStatics) {
      const key = staticStrings.join('$$lit$$');
      strings = stringsCache.get(key)!;
      if (strings === undefined) {
        stringsCache.set(
          key,
          (strings = staticStrings as unknown as TemplateStringsArray)
        );
      }
      values = dynamicValues;
    }
    return coreTag(strings, ...values);
  };

/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 *
 * Includes static value support from `lit-html/static.js`.
 */
export const html = withStatic(coreHtml);

/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 *
 * Includes static value support from `lit-html/static.js`.
 */
export const svg = withStatic(coreSvg);
