/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {fnva64} from './fnva64.js';

/**
 * Delimiter used between each template string component before hashing. Used to
 * prevent e.g. "foobar" and "foo${baz}bar" from sharing a hash.
 *
 * This is the "record separator" ASCII character.
 */
export const HASH_DELIMITER = String.fromCharCode(30);

/**
 * Id scheme version prefix to distinguish this implementation from potential
 * changes in the future.
 */
const VERSION_PREFIX = '0';

/**
 * Id prefix on html-tagged templates to distinguish e.g. `<b>x</b>` from
 * html`<b>x</b>`.
 */
const HTML_PREFIX = 'h';

/**
 * Id prefix on plain string templates to distinguish e.g. `<b>x</b>` from
 * html`<b>x</b>`.
 */
const STRING_PREFIX = 's';

/**
 * Generate a unique ID for a lit-localize message.
 *
 * Example:
 *   Template: html`Hello <b>${who}</b>!`
 *     Params: ["Hello <b>", "</b>!"], true
 *     Output: 0h82ccc38d4d46eaa9
 *
 * The ID is constructed as:
 *
 *   [0]    Version number to annotate this ID generation scheme.
 *   [1]    Kind of template: [h]tml or [s]string.
 *   [2,17] 64-bit FNV-A hash hex digest of the template strings, where each
 *          string is delineated by an ASCII "record separator" character.
 *
 * We choose FNV-A because:
 *
 *   1. It's pretty fast (see table).
 *   2. It's pretty small (see table).
 *   3. We can't use Web Crypto API, because it's asynchronous.
 *   4. We don't require cryptographic security.
 *   5. It should give sufficient collision resistance for any one application.
 *      Worst case, we will always detect collisions during analysis.
 *   6. There was an existing JavaScript implementation.
 *
 * Comparison of hash functions:
 *
 * Function    | Bits | Hashes/sec | KiB  | Collisions
 * ----------- | ---- | ---------- | ---- | ----------
 * FNV-A   [0] |   64 | 1.48M      | 0.29 | 0
 * FNV-A   [0] |   52 | 1.54M      | 0.30 | 0
 * SHA-1   [1] |  160 | 0.35M      | 0.90 | 0
 * Murmur2 [2] |   32 | 2.57M      | 0.22 | 228
 * Murmur3 [3] |   32 | 2.19M      | 0.32 | 290
 * cyrb53  [4] |   53 | 1.65M      | 0.20 | 0
 * djb2a   [5] |   32 | 1.79M      | 0.10 | 147
 *
 * [0] https://github.com/tjwebb/fnv-plus/blob/1e2ce68a07cb7dd4c3c85364f3d8d96c95919474/index.js#L309
 * [1] https://github.com/emn178/js-sha1/blob/master/src/sha1.js
 * [2] https://github.com/garycourt/murmurhash-js/blob/master/murmurhash2_gc.js
 * [3] https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
 * [4] https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
 * [5] https://github.com/sindresorhus/djb2a/blob/master/index.js
 */
export function generateMsgId(
  strings: string | string[] | TemplateStringsArray,
  isHtmlTagged: boolean
): string {
  return (
    VERSION_PREFIX +
    (isHtmlTagged ? HTML_PREFIX : STRING_PREFIX) +
    fnva64(typeof strings === 'string' ? strings : strings.join(HASH_DELIMITER))
  );
}
